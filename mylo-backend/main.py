import glob
import json
import pathlib
import pickle
import shutil
import subprocess
import time
import uuid
import os

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
import modal
from pydantic import BaseModel
import requests


class ProcessVideoRequest(BaseModel):
    cloudinary_public_id: str | None = None
    youtube_url: str | None = None
    # Processing options
    remove_silences: bool = True
    remove_filler_words: bool = True
    transition_style: str = "fade"  # fade, wipe, slide, none
    auto_zoom: bool = True
    zoom_intensity: float = 1.5  # 1.2x to 2x
    auto_censor: bool = False
    caption_style: str = "default"  # default, mrbeast, hormozi, aliabdaal


class TextEditSegment(BaseModel):
    word: str
    start: float
    end: float
    keep: bool = True  # Whether to keep this segment


class TextEditRequest(BaseModel):
    cloudinary_public_id: str  # Original clip's cloudinary ID
    segments: list[TextEditSegment]  # Word segments with keep/remove flags
    caption_style: str = "default"
    transition_style: str = "fade"


# Filler words to remove
FILLER_WORDS = ["um", "uh", "like", "you know", "so", "actually", "basically", "literally", "i mean", "right"]

# Profanity list for auto-censoring
PROFANITY_WORDS = ["fuck", "fucking", "fucked", "shit", "shitting", "damn", "ass", "bitch", "bastard", "crap", "hell"]

# Caption style presets
CAPTION_STYLES = {
    "default": {
        "fontname": "Anton",
        "fontsize": 140,
        "primarycolor": (255, 255, 255),  # White
        "outlinecolor": (0, 0, 0),  # Black
        "outline": 2.0,
        "shadow": 2.0,
    },
    "mrbeast": {
        "fontname": "Anton",
        "fontsize": 160,
        "primarycolor": (255, 255, 0),  # Yellow
        "outlinecolor": (0, 0, 0),  # Black
        "outline": 4.0,
        "shadow": 3.0,
    },
    "hormozi": {
        "fontname": "Anton",
        "fontsize": 150,
        "primarycolor": (255, 255, 255),  # White
        "outlinecolor": (255, 0, 0),  # Red highlights
        "outline": 3.0,
        "shadow": 2.0,
    },
    "aliabdaal": {
        "fontname": "Anton",
        "fontsize": 120,
        "primarycolor": (255, 255, 255),  # White
        "outlinecolor": (50, 50, 50),  # Subtle gray
        "outline": 1.5,
        "shadow": 1.0,
    },
}


image = (modal.Image.from_registry("python:3.11-bullseye")
    .apt_install(["ffmpeg", "libgl1-mesa-glx", "wget"])
    .pip_install(
        "google-generativeai",
        "cloudinary",
        "yt-dlp",
        "groq",
        "opencv-python-headless",
        "numpy",
        "pillow",
        "pydantic",
        "fastapi",
        "requests",
        "pysubs2",
        "ffmpegcv",
        "tqdm",
    )
    .run_commands(["mkdir -p /usr/share/fonts/truetype/custom",
                   "wget -O /usr/share/fonts/truetype/custom/Anton-Regular.ttf https://github.com/google/fonts/raw/main/ofl/anton/Anton-Regular.ttf",
                   "fc-cache -f -v"])
    .add_local_dir("asd", "/asd", copy=True))

app = modal.App("mylo", image=image)

volume = modal.Volume.from_name(
    "mylo-model-cache", create_if_missing=True
)

mount_path = "/root/.cache/torch"

auth_scheme = HTTPBearer()


def remove_silences_from_video(input_path: str, output_path: str, threshold_db: int = -50, min_silence_duration: float = 0.5):
    """Remove long silences/pauses from video using FFmpeg silenceremove filter"""
    cmd = (
        f'ffmpeg -y -i {input_path} '
        f'-af "silenceremove=stop_periods=-1:stop_duration={min_silence_duration}:stop_threshold={threshold_db}dB" '
        f'-c:v copy {output_path}'
    )
    subprocess.run(cmd, shell=True, check=True, capture_output=True)
    return output_path


def remove_filler_words_from_video(input_path: str, output_path: str, transcript_segments: list, clip_start: float, clip_end: float):
    """Remove filler words from video by cutting those segments"""
    # Find filler word segments within this clip
    filler_segments = []
    for segment in transcript_segments:
        word = segment.get("word", "").strip().lower()
        seg_start = segment.get("start", 0)
        seg_end = segment.get("end", 0)
        
        # Check if segment is within clip bounds
        if seg_start >= clip_start and seg_end <= clip_end:
            # Check if it's a filler word
            if word in FILLER_WORDS or any(filler in word for filler in FILLER_WORDS):
                # Convert to relative time within clip
                rel_start = seg_start - clip_start
                rel_end = seg_end - clip_start
                filler_segments.append((rel_start, rel_end))
    
    if not filler_segments:
        # No filler words, just copy
        shutil.copy(input_path, output_path)
        return output_path
    
    # Build FFmpeg select filter to exclude filler segments
    # Create segments to KEEP (inverse of filler segments)
    keep_segments = []
    last_end = 0
    clip_duration = clip_end - clip_start
    
    for start, end in sorted(filler_segments):
        if start > last_end:
            keep_segments.append((last_end, start))
        last_end = end
    
    if last_end < clip_duration:
        keep_segments.append((last_end, clip_duration))
    
    if not keep_segments:
        shutil.copy(input_path, output_path)
        return output_path
    
    # Build select expression
    select_parts = []
    for start, end in keep_segments:
        select_parts.append(f"between(t,{start:.3f},{end:.3f})")
    
    select_expr = "+".join(select_parts)
    
    cmd = (
        f'ffmpeg -y -i {input_path} '
        f'-vf "select=\'{select_expr}\',setpts=N/FRAME_RATE/TB" '
        f'-af "aselect=\'{select_expr}\',asetpts=N/SR/TB" '
        f'{output_path}'
    )
    
    try:
        subprocess.run(cmd, shell=True, check=True, capture_output=True)
    except subprocess.CalledProcessError:
        # If filter fails, just copy original
        shutil.copy(input_path, output_path)
    
    return output_path


def apply_auto_zoom(input_path: str, output_path: str, zoom_moments: list, zoom_intensity: float = 1.5):
    """Apply zoom effects at specified moments using FFmpeg zoompan filter"""
    if not zoom_moments:
        shutil.copy(input_path, output_path)
        return output_path
    
    # Build zoom expression for FFmpeg
    # zoompan filter: z='if(between(t,start,end),zoom,1)'
    zoom_parts = []
    for moment in zoom_moments:
        start = moment.get("start", 0)
        end = moment.get("end", start + 2)  # Default 2 second zoom
        zoom_parts.append(f"if(between(t,{start},{end}),{zoom_intensity},1)")
    
    # Combine all zoom conditions with max() to handle overlaps
    if len(zoom_parts) == 1:
        zoom_expr = zoom_parts[0]
    else:
        zoom_expr = f"max({','.join(zoom_parts)})"
    
    # Get video dimensions
    probe_cmd = f'ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0 {input_path}'
    result = subprocess.run(probe_cmd, shell=True, capture_output=True, text=True)
    try:
        width, height = map(int, result.stdout.strip().split(','))
    except ValueError:
        width, height = 1080, 1920
    
    cmd = (
        f'ffmpeg -y -i {input_path} '
        f'-vf "zoompan=z=\'{zoom_expr}\':x=\'iw/2-(iw/zoom/2)\':y=\'ih/2-(ih/zoom/2)\':d=1:s={width}x{height}:fps=25" '
        f'-c:a copy {output_path}'
    )
    
    try:
        subprocess.run(cmd, shell=True, check=True, capture_output=True)
    except subprocess.CalledProcessError as e:
        print(f"Zoom filter failed: {e}, copying original")
        shutil.copy(input_path, output_path)
    
    return output_path


def apply_auto_censor(input_path: str, output_path: str, transcript_segments: list, clip_start: float, clip_end: float):
    """Replace profanity with beep sounds"""
    # Find profanity segments
    profanity_segments = []
    for segment in transcript_segments:
        word = segment.get("word", "").strip().lower()
        seg_start = segment.get("start", 0)
        seg_end = segment.get("end", 0)
        
        if seg_start >= clip_start and seg_end <= clip_end:
            # Check if word contains profanity
            for profanity in PROFANITY_WORDS:
                if profanity in word:
                    rel_start = seg_start - clip_start
                    rel_end = seg_end - clip_start
                    profanity_segments.append((rel_start, rel_end))
                    break
    
    if not profanity_segments:
        shutil.copy(input_path, output_path)
        return output_path
    
    # Build FFmpeg filter to replace audio with beep at profanity timestamps
    # Generate beep tone and mix it in
    filter_parts = []
    for i, (start, end) in enumerate(profanity_segments):
        duration = end - start
        # Create volume filter to mute original audio during profanity
        filter_parts.append(f"volume=enable='between(t,{start},{end})':volume=0")
    
    volume_filter = ",".join(filter_parts) if filter_parts else "anull"
    
    # Generate beep overlay
    beep_filters = []
    for i, (start, end) in enumerate(profanity_segments):
        duration = end - start
        beep_filters.append(f"sine=frequency=1000:duration={duration}:sample_rate=44100,adelay={int(start*1000)}|{int(start*1000)}")
    
    if beep_filters:
        beep_mix = f"[0:a]{volume_filter}[muted];{';'.join([f'[beep{i}]' for i in range(len(beep_filters))])}"
        # Simplified approach: just mute the profanity
        cmd = (
            f'ffmpeg -y -i {input_path} '
            f'-af "{volume_filter}" '
            f'-c:v copy {output_path}'
        )
    else:
        cmd = f'ffmpeg -y -i {input_path} -c copy {output_path}'
    
    try:
        subprocess.run(cmd, shell=True, check=True, capture_output=True)
    except subprocess.CalledProcessError:
        shutil.copy(input_path, output_path)
    
    return output_path


def generate_thumbnail(video_path: str, output_path: str, title: str = ""):
    """Extract best frame from video and add title overlay for thumbnail"""
    import cv2
    
    # Get video duration
    probe_cmd = f'ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 {video_path}'
    result = subprocess.run(probe_cmd, shell=True, capture_output=True, text=True)
    try:
        duration = float(result.stdout.strip())
    except ValueError:
        duration = 30.0
    
    # Extract frames at 5 positions: start, 25%, 50%, 75%, end
    positions = [0.1, 0.25, 0.5, 0.75, 0.9]
    best_frame = None
    best_score = -1
    
    cap = cv2.VideoCapture(str(video_path))
    fps = cap.get(cv2.CAP_PROP_FPS) or 25
    
    for pos in positions:
        frame_num = int(pos * duration * fps)
        cap.set(cv2.CAP_PROP_POS_FRAMES, frame_num)
        ret, frame = cap.read()
        
        if ret and frame is not None:
            # Simple scoring: prefer frames with good contrast and brightness
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            score = gray.std() + gray.mean() * 0.5  # Contrast + brightness
            
            if score > best_score:
                best_score = score
                best_frame = frame
    
    cap.release()
    
    if best_frame is None:
        return None
    
    # Add title overlay if provided
    if title:
        height, width = best_frame.shape[:2]
        font = cv2.FONT_HERSHEY_DUPLEX
        font_scale = 1.5
        thickness = 3
        
        # Get text size
        (text_width, text_height), baseline = cv2.getTextSize(title[:50], font, font_scale, thickness)
        
        # Position at bottom center
        x = (width - text_width) // 2
        y = height - 100
        
        # Draw text with outline
        cv2.putText(best_frame, title[:50], (x, y), font, font_scale, (0, 0, 0), thickness + 2)
        cv2.putText(best_frame, title[:50], (x, y), font, font_scale, (255, 255, 255), thickness)
    
    cv2.imwrite(output_path, best_frame)
    return output_path


def render_from_segments(input_path: str, output_path: str, segments: list, caption_style: str = "default"):
    """Render video keeping only the specified segments (text-based editing)"""
    import pysubs2
    
    # Filter to only kept segments
    keep_segments = [(seg["start"], seg["end"]) for seg in segments if seg.get("keep", True)]
    
    if not keep_segments:
        raise ValueError("No segments to keep")
    
    # Merge adjacent segments (within 0.1s gap)
    merged_segments = []
    for start, end in sorted(keep_segments):
        if merged_segments and start - merged_segments[-1][1] < 0.1:
            merged_segments[-1] = (merged_segments[-1][0], end)
        else:
            merged_segments.append((start, end))
    
    # Build FFmpeg select filter
    select_parts = []
    for start, end in merged_segments:
        select_parts.append(f"between(t,{start:.3f},{end:.3f})")
    
    select_expr = "+".join(select_parts)
    
    # Create temp output without subtitles
    temp_output = output_path.replace(".mp4", "_temp.mp4")
    
    cmd = (
        f'ffmpeg -y -i {input_path} '
        f'-vf "select=\'{select_expr}\',setpts=N/FRAME_RATE/TB" '
        f'-af "aselect=\'{select_expr}\',asetpts=N/SR/TB" '
        f'-c:v h264 -preset fast -crf 23 {temp_output}'
    )
    
    try:
        subprocess.run(cmd, shell=True, check=True, capture_output=True)
    except subprocess.CalledProcessError as e:
        print(f"Error rendering segments: {e}")
        raise
    
    # Now add subtitles for kept segments
    temp_dir = os.path.dirname(output_path)
    subtitle_path = os.path.join(temp_dir, "edit_subtitles.ass")
    
    # Build subtitles from kept segments
    subs = pysubs2.SSAFile()
    subs.info["WrapStyle"] = 0
    subs.info["ScaledBorderAndShadow"] = "yes"
    subs.info["PlayResX"] = 1080
    subs.info["PlayResY"] = 1920
    subs.info["ScriptType"] = "v4.00+"
    
    style_preset = CAPTION_STYLES.get(caption_style, CAPTION_STYLES["default"])
    new_style = pysubs2.SSAStyle()
    new_style.fontname = style_preset["fontname"]
    new_style.fontsize = style_preset["fontsize"]
    new_style.primarycolor = pysubs2.Color(*style_preset["primarycolor"])
    new_style.outlinecolor = pysubs2.Color(*style_preset["outlinecolor"])
    new_style.outline = style_preset["outline"]
    new_style.shadow = style_preset["shadow"]
    new_style.shadowcolor = pysubs2.Color(0, 0, 0, 128)
    new_style.alignment = 2
    new_style.marginl = 50
    new_style.marginr = 50
    new_style.marginv = 50
    subs.styles["Default"] = new_style
    
    # Calculate new timestamps after segment removal
    current_time = 0.0
    word_groups = []
    current_group = []
    
    for seg in segments:
        if seg.get("keep", True):
            word = seg.get("word", "").strip()
            duration = seg["end"] - seg["start"]
            
            current_group.append({
                "word": word,
                "start": current_time,
                "end": current_time + duration
            })
            current_time += duration
            
            # Group every 5 words
            if len(current_group) >= 5:
                word_groups.append(current_group)
                current_group = []
    
    if current_group:
        word_groups.append(current_group)
    
    # Create subtitle events
    for group in word_groups:
        if group:
            text = " ".join([w["word"] for w in group])
            start_time = pysubs2.make_time(s=group[0]["start"])
            end_time = pysubs2.make_time(s=group[-1]["end"])
            line = pysubs2.SSAEvent(start=start_time, end=end_time, text=text, style="Default")
            subs.events.append(line)
    
    subs.save(subtitle_path)
    
    # Apply subtitles
    ffmpeg_cmd = (f'ffmpeg -y -i {temp_output} -vf "ass={subtitle_path}" '
                  f'-c:v h264 -preset fast -crf 23 {output_path}')
    
    subprocess.run(ffmpeg_cmd, shell=True, check=True)
    
    # Cleanup temp file
    try:
        os.remove(temp_output)
    except:
        pass
    
    return output_path


def apply_transition(clip_path: str, output_path: str, transition_style: str = "fade"):
    """Apply fade-in/fade-out transitions to a clip"""
    if transition_style == "none":
        shutil.copy(clip_path, output_path)
        return output_path
    
    # Get video duration
    probe_cmd = f'ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 {clip_path}'
    result = subprocess.run(probe_cmd, shell=True, capture_output=True, text=True)
    try:
        duration = float(result.stdout.strip())
    except ValueError:
        duration = 30.0  # Default
    
    fade_duration = 0.3
    fade_out_start = max(0, duration - fade_duration)
    
    if transition_style == "fade":
        cmd = (
            f'ffmpeg -y -i {clip_path} '
            f'-vf "fade=t=in:st=0:d={fade_duration},fade=t=out:st={fade_out_start}:d={fade_duration}" '
            f'-af "afade=t=in:st=0:d={fade_duration},afade=t=out:st={fade_out_start}:d={fade_duration}" '
            f'-c:v h264 -preset fast -crf 23 {output_path}'
        )
    elif transition_style == "wipe":
        # Wipe effect using blend
        cmd = (
            f'ffmpeg -y -i {clip_path} '
            f'-vf "fade=t=in:st=0:d={fade_duration}:alpha=1,fade=t=out:st={fade_out_start}:d={fade_duration}:alpha=1" '
            f'-c:v h264 -preset fast -crf 23 {output_path}'
        )
    else:  # slide or default
        cmd = (
            f'ffmpeg -y -i {clip_path} '
            f'-vf "fade=t=in:st=0:d={fade_duration},fade=t=out:st={fade_out_start}:d={fade_duration}" '
            f'-c:v h264 -preset fast -crf 23 {output_path}'
        )
    
    try:
        subprocess.run(cmd, shell=True, check=True, capture_output=True)
    except subprocess.CalledProcessError:
        shutil.copy(clip_path, output_path)
    
    return output_path


def create_vertical_video(tracks, scores, pyframes_path, pyavi_path, audio_path, output_path, framerate=25):
    import cv2
    import ffmpegcv
    import numpy as np
    from tqdm import tqdm
    
    target_width = 1080
    target_height = 1920

    flist = glob.glob(os.path.join(pyframes_path, "*.jpg"))
    flist.sort()

    faces = [[] for _ in range(len(flist))]

    for tidx, track in enumerate(tracks):
        score_array = scores[tidx]
        for fidx, frame in enumerate(track["track"]["frame"].tolist()):
            slice_start = max(fidx - 30, 0)
            slice_end = min(fidx + 30, len(score_array))
            score_slice = score_array[slice_start:slice_end]
            avg_score = float(np.mean(score_slice)
                              if len(score_slice) > 0 else 0)

            faces[frame].append(
                {'track': tidx, 'score': avg_score, 's': track['proc_track']["s"][fidx], 'x': track['proc_track']["x"][fidx], 'y': track['proc_track']["y"][fidx]})

    temp_video_path = os.path.join(pyavi_path, "video_only.mp4")

    vout = None
    for fidx, fname in tqdm(enumerate(flist), total=len(flist), desc="Creating vertical video"):
        img = cv2.imread(fname)
        if img is None:
            continue

        current_faces = faces[fidx]

        max_score_face = max(
            current_faces, key=lambda face: face['score']) if current_faces else None

        if max_score_face and max_score_face['score'] < 0:
            max_score_face = None

        if vout is None:
            vout = ffmpegcv.VideoWriterNV(
                file=temp_video_path,
                codec=None,
                fps=framerate,
                resize=(target_width, target_height)
            )

        if max_score_face:
            mode = "crop"
        else:
            mode = "resize"

        if mode == "resize":
            scale = target_width / img.shape[1]
            resized_height = int(img.shape[0] * scale)
            resized_image = cv2.resize(
                img, (target_width, resized_height), interpolation=cv2.INTER_AREA)

            scale_for_bg = max(
                target_width / img.shape[1], target_height / img.shape[0])
            bg_width = int(img.shape[1] * scale_for_bg)
            bg_heigth = int(img.shape[0] * scale_for_bg)

            blurred_background = cv2.resize(img, (bg_width, bg_heigth))
            blurred_background = cv2.GaussianBlur(
                blurred_background, (121, 121), 0)

            crop_x = (bg_width - target_width) // 2
            crop_y = (bg_heigth - target_height) // 2
            blurred_background = blurred_background[crop_y:crop_y +
                                                    target_height, crop_x:crop_x + target_width]

            center_y = (target_height - resized_height) // 2
            blurred_background[center_y:center_y +
                               resized_height, :] = resized_image

            vout.write(blurred_background)

        elif mode == "crop":
            scale = target_height / img.shape[0]
            resized_image = cv2.resize(
                img, None, fx=scale, fy=scale, interpolation=cv2.INTER_AREA)
            frame_width = resized_image.shape[1]

            center_x = int(
                max_score_face["x"] * scale if max_score_face else frame_width // 2)
            top_x = max(min(center_x - target_width // 2,
                        frame_width - target_width), 0)

            image_cropped = resized_image[0:target_height,
                                          top_x:top_x + target_width]

            vout.write(image_cropped)

    if vout:
        vout.release()

    ffmpeg_command = (f"ffmpeg -y -i {temp_video_path} -i {audio_path} "
                      f"-c:v h264 -preset fast -crf 23 -c:a aac -b:a 128k "
                      f"{output_path}")
    subprocess.run(ffmpeg_command, shell=True, check=True, text=True)


def create_subtitles_with_ffmpeg(transcript_segments: list, clip_start: float, clip_end: float, clip_video_path: str, output_path: str, max_words: int = 5, caption_style: str = "default"):
    import pysubs2
    
    temp_dir = os.path.dirname(output_path)
    subtitle_path = os.path.join(temp_dir, "temp_subtitles.ass")

    clip_segments = [segment for segment in transcript_segments
                     if segment.get("start") is not None
                     and segment.get("end") is not None
                     and segment.get("end") > clip_start
                     and segment.get("start") < clip_end
                     ]

    subtitles = []
    current_words = []
    current_start = None
    current_end = None

    for segment in clip_segments:
        word = segment.get("word", "").strip()
        seg_start = segment.get("start")
        seg_end = segment.get("end")

        if not word or seg_start is None or seg_end is None:
            continue

        start_rel = max(0.0, seg_start - clip_start)
        end_rel = max(0.0, seg_end - clip_start)

        if end_rel <= 0:
            continue

        if not current_words:
            current_start = start_rel
            current_end = end_rel
            current_words = [word]
        elif len(current_words) >= max_words:
            subtitles.append(
                (current_start, current_end, ' '.join(current_words)))
            current_words = [word]
            current_start = start_rel
            current_end = end_rel
        else:
            current_words.append(word)
            current_end = end_rel

    if current_words:
        subtitles.append(
            (current_start, current_end, ' '.join(current_words)))

    subs = pysubs2.SSAFile()

    subs.info["WrapStyle"] = 0
    subs.info["ScaledBorderAndShadow"] = "yes"
    subs.info["PlayResX"] = 1080
    subs.info["PlayResY"] = 1920
    subs.info["ScriptType"] = "v4.00+"

    # Get style preset
    style_preset = CAPTION_STYLES.get(caption_style, CAPTION_STYLES["default"])

    style_name = "Default"
    new_style = pysubs2.SSAStyle()
    new_style.fontname = style_preset["fontname"]
    new_style.fontsize = style_preset["fontsize"]
    new_style.primarycolor = pysubs2.Color(*style_preset["primarycolor"])
    new_style.outlinecolor = pysubs2.Color(*style_preset["outlinecolor"])
    new_style.outline = style_preset["outline"]
    new_style.shadow = style_preset["shadow"]
    new_style.shadowcolor = pysubs2.Color(0, 0, 0, 128)
    new_style.alignment = 2
    new_style.marginl = 50
    new_style.marginr = 50
    new_style.marginv = 50
    new_style.spacing = 0.0

    subs.styles[style_name] = new_style

    for i, (start, end, text) in enumerate(subtitles):
        start_time = pysubs2.make_time(s=start)
        end_time = pysubs2.make_time(s=end)
        line = pysubs2.SSAEvent(
            start=start_time, end=end_time, text=text, style=style_name)
        subs.events.append(line)

    subs.save(subtitle_path)

    ffmpeg_cmd = (f"ffmpeg -y -i {clip_video_path} -vf \"ass={subtitle_path}\" "
                  f"-c:v h264 -preset fast -crf 23 {output_path}")

    subprocess.run(ffmpeg_cmd, shell=True, check=True)


def process_clip(base_dir: str, original_video_path: str, s3_key: str, start_time: float, end_time: float, clip_index: int, transcript_segments: list, options: dict = None, zoom_moments: list = None):
    import cloudinary
    import cloudinary.uploader
    
    options = options or {}
    remove_silences = options.get("remove_silences", True)
    remove_filler = options.get("remove_filler_words", True)
    transition_style = options.get("transition_style", "fade")
    auto_zoom = options.get("auto_zoom", True)
    zoom_intensity = options.get("zoom_intensity", 1.5)
    auto_censor = options.get("auto_censor", False)
    caption_style = options.get("caption_style", "default")
    
    clip_name = f"clip_{clip_index}"
    s3_key_dir = os.path.dirname(s3_key)
    output_s3_key = f"{s3_key_dir}/{clip_name}.mp4"
    print(f"Output S3 key: {output_s3_key}")

    clip_dir = base_dir / clip_name
    clip_dir.mkdir(parents=True, exist_ok=True)

    clip_segment_path = clip_dir / f"{clip_name}_segment.mp4"
    vertical_mp4_path = clip_dir / "pyavi" / "video_out_vertical.mp4"
    subtitle_output_path = clip_dir / "pyavi" / "video_with_subtitles.mp4"
    final_output_path = clip_dir / "pyavi" / "video_final.mp4"

    (clip_dir / "pywork").mkdir(exist_ok=True)
    pyframes_path = clip_dir / "pyframes"
    pyavi_path = clip_dir / "pyavi"
    audio_path = clip_dir / "pyavi" / "audio.wav"

    pyframes_path.mkdir(exist_ok=True)
    pyavi_path.mkdir(exist_ok=True)

    duration = end_time - start_time
    cut_command = (f"ffmpeg -i {original_video_path} -ss {start_time} -t {duration} "
                   f"{clip_segment_path}")
    subprocess.run(cut_command, shell=True, check=True,
                   capture_output=True, text=True)

    extract_cmd = f"ffmpeg -i {clip_segment_path} -vn -acodec pcm_s16le -ar 16000 -ac 1 {audio_path}"
    subprocess.run(extract_cmd, shell=True,
                   check=True, capture_output=True)

    shutil.copy(clip_segment_path, base_dir / f"{clip_name}.mp4")

    columbia_command = (f"python Columbia_test.py --videoName {clip_name} "
                        f"--videoFolder {str(base_dir)} "
                        f"--pretrainModel weight/finetuning_TalkSet.model")

    columbia_start_time = time.time()
    subprocess.run(columbia_command, cwd="/asd", shell=True)
    columbia_end_time = time.time()
    print(
        f"Columbia script completed in {columbia_end_time - columbia_start_time:.2f} seconds")

    tracks_path = clip_dir / "pywork" / "tracks.pckl"
    scores_path = clip_dir / "pywork" / "scores.pckl"
    if not tracks_path.exists() or not scores_path.exists():
        raise FileNotFoundError("Tracks or scores not found for clip")

    with open(tracks_path, "rb") as f:
        tracks = pickle.load(f)

    with open(scores_path, "rb") as f:
        scores = pickle.load(f)

    cvv_start_time = time.time()
    create_vertical_video(
        tracks, scores, pyframes_path, pyavi_path, audio_path, vertical_mp4_path
    )
    cvv_end_time = time.time()
    print(
        f"Clip {clip_index} vertical video creation time: {cvv_end_time - cvv_start_time:.2f} seconds")

    create_subtitles_with_ffmpeg(transcript_segments, start_time,
                                 end_time, vertical_mp4_path, subtitle_output_path, max_words=5, caption_style=caption_style)

    # Apply post-processing effects
    current_video = subtitle_output_path
    
    # Apply auto-censoring if enabled
    if auto_censor:
        censored_path = clip_dir / "pyavi" / "video_censored.mp4"
        try:
            apply_auto_censor(str(current_video), str(censored_path), transcript_segments, start_time, end_time)
            current_video = censored_path
            print(f"Applied auto-censoring to clip {clip_index}")
        except Exception as e:
            print(f"Warning: Could not apply auto-censoring: {e}")
    
    # Apply auto-zoom if enabled and we have zoom moments
    if auto_zoom and zoom_moments:
        zoomed_path = clip_dir / "pyavi" / "video_zoomed.mp4"
        try:
            apply_auto_zoom(str(current_video), str(zoomed_path), zoom_moments, zoom_intensity)
            current_video = zoomed_path
            print(f"Applied auto-zoom to clip {clip_index}")
        except Exception as e:
            print(f"Warning: Could not apply auto-zoom: {e}")
    
    # Remove silences if enabled
    if remove_silences:
        silence_removed_path = clip_dir / "pyavi" / "video_no_silence.mp4"
        try:
            remove_silences_from_video(str(current_video), str(silence_removed_path))
            current_video = silence_removed_path
            print(f"Removed silences from clip {clip_index}")
        except Exception as e:
            print(f"Warning: Could not remove silences: {e}")
    
    # Remove filler words if enabled
    if remove_filler:
        filler_removed_path = clip_dir / "pyavi" / "video_no_filler.mp4"
        try:
            remove_filler_words_from_video(str(current_video), str(filler_removed_path), transcript_segments, start_time, end_time)
            current_video = filler_removed_path
            print(f"Removed filler words from clip {clip_index}")
        except Exception as e:
            print(f"Warning: Could not remove filler words: {e}")
    
    # Apply transitions
    if transition_style != "none":
        try:
            apply_transition(str(current_video), str(final_output_path), transition_style)
            current_video = final_output_path
            print(f"Applied {transition_style} transition to clip {clip_index}")
        except Exception as e:
            print(f"Warning: Could not apply transition: {e}")
    else:
        shutil.copy(str(current_video), str(final_output_path))
        current_video = final_output_path

    # Generate thumbnail
    thumbnail_path = clip_dir / "thumbnail.jpg"
    thumbnail_url = None
    try:
        generate_thumbnail(str(current_video), str(thumbnail_path))
        # Upload thumbnail to Cloudinary
        thumb_result = cloudinary.uploader.upload(
            str(thumbnail_path),
            resource_type="image",
            public_id=f"{output_s3_key.replace('/', '_')}_thumb",
            folder="mylo-thumbnails",
            overwrite=True
        )
        thumbnail_url = thumb_result.get('secure_url', '')
        print(f"Generated and uploaded thumbnail for clip {clip_index}")
    except Exception as e:
        print(f"Warning: Could not generate thumbnail: {e}")

    # Upload to Cloudinary
    try:
        result = cloudinary.uploader.upload(
            str(current_video),
            resource_type="video",
            public_id=output_s3_key.replace("/", "_"),
            folder="mylo-videos",
            overwrite=True
        )
        print(f"Uploaded clip to Cloudinary: {result['public_id']}")
        return {
            "cloudinary_public_id": result['public_id'],
            "cloudinary_url": result.get('secure_url', ''),
            "thumbnail_url": thumbnail_url,
            "clip_index": clip_index
        }
    except Exception as e:
        print(f"Error uploading to Cloudinary: {e}")
        raise


@app.cls(gpu="L40S", timeout=900, retries=0, scaledown_window=20, secrets=[modal.Secret.from_name("mylo-secret")], volumes={mount_path: volume})
class MyloVideoClipper:
    @modal.enter()
    def load_model(self):
        import whisperx
        from google import genai
        import cloudinary
        
        print("Loading models")

        self.whisperx_model = whisperx.load_model(
            "large-v2", device="cuda", compute_type="float16")

        self.alignment_model, self.metadata = whisperx.load_align_model(
            language_code="en",
            device="cuda"
        )

        print("Transcription models loaded...")

        print("Creating gemini client...")
        self.gemini_client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])
        print("Created gemini client...")
        
        # Configure Cloudinary
        cloudinary.config(
            cloud_name=os.environ["CLOUDINARY_CLOUD_NAME"],
            api_key=os.environ["CLOUDINARY_API_KEY"],
            api_secret=os.environ["CLOUDINARY_API_SECRET"]
        )
        print("Cloudinary configured...")

    def transcribe_video(self, base_dir: str, video_path: str) -> str:
        import whisperx
        
        audio_path = base_dir / "audio.wav"
        extract_cmd = f"ffmpeg -i {video_path} -vn -acodec pcm_s16le -ar 16000 -ac 1 {audio_path}"
        subprocess.run(extract_cmd, shell=True,
                       check=True, capture_output=True)

        print("Starting transcription with WhisperX...")
        start_time = time.time()

        audio = whisperx.load_audio(str(audio_path))
        result = self.whisperx_model.transcribe(audio, batch_size=16)

        result = whisperx.align(
            result["segments"],
            self.alignment_model,
            self.metadata,
            audio,
            device="cuda",
            return_char_alignments=False
        )

        duration = time.time() - start_time
        print("Transcription and alignment took " + str(duration) + " seconds")

        segments = []

        if "word_segments" in result:
            for word_segment in result["word_segments"]:
                segments.append({
                    "start": word_segment["start"],
                    "end": word_segment["end"],
                    "word": word_segment["word"],
                })

        return json.dumps(segments)

    def generate_titles(self, transcript_text: str) -> list:
        """Generate 3 viral hook titles for a clip using Gemini"""
        try:
            response = self.gemini_client.models.generate_content(
                model="gemini-2.5-flash-preview-04-17",
                contents=f"""Generate 3 catchy, viral TikTok/Instagram titles (under 100 chars each) for this video clip. 
Make them attention-grabbing, clickable, and use hooks that make people want to watch.
Return ONLY a JSON array of 3 strings, no other text.
Example: ["Title 1", "Title 2", "Title 3"]

Transcript:
{transcript_text}"""
            )
            
            result = response.text.strip()
            if result.startswith("```json"):
                result = result[7:]
            if result.startswith("```"):
                result = result[3:]
            if result.endswith("```"):
                result = result[:-3]
            
            titles = json.loads(result.strip())
            return titles[:3] if isinstance(titles, list) else []
        except Exception as e:
            print(f"Error generating titles: {e}")
            return ["Check out this clip!", "You won't believe this!", "This is amazing!"]

    def generate_description_and_hashtags(self, transcript_text: str) -> dict:
        """Generate viral caption and hashtags for a clip using Gemini"""
        try:
            response = self.gemini_client.models.generate_content(
                model="gemini-2.5-flash-preview-04-17",
                contents=f"""Write a viral TikTok/Instagram caption (2-3 sentences max) and 5 relevant hashtags for this video.
Return ONLY a JSON object with "caption" and "hashtags" keys.
Example: {{"caption": "Your caption here", "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5"]}}

Transcript:
{transcript_text}"""
            )
            
            result = response.text.strip()
            if result.startswith("```json"):
                result = result[7:]
            if result.startswith("```"):
                result = result[3:]
            if result.endswith("```"):
                result = result[:-3]
            
            data = json.loads(result.strip())
            return {
                "caption": data.get("caption", ""),
                "hashtags": data.get("hashtags", [])[:5]
            }
        except Exception as e:
            print(f"Error generating description: {e}")
            return {
                "caption": "Check out this amazing clip!",
                "hashtags": ["#viral", "#fyp", "#trending", "#content", "#video"]
            }

    def identify_zoom_moments(self, transcript_segments: list, clip_start: float, clip_end: float) -> list:
        """Use Gemini to identify high-energy moments for zoom effects"""
        try:
            # Get transcript text with timestamps for this clip
            clip_words = []
            for seg in transcript_segments:
                if seg.get("start", 0) >= clip_start and seg.get("end", 0) <= clip_end:
                    clip_words.append({
                        "word": seg.get("word", ""),
                        "start": seg.get("start", 0) - clip_start,  # Relative time
                        "end": seg.get("end", 0) - clip_start
                    })
            
            if not clip_words:
                return []
            
            response = self.gemini_client.models.generate_content(
                model="gemini-2.5-flash-preview-04-17",
                contents=f"""Analyze this transcript and identify 2-3 "high-energy" moments that would benefit from a zoom effect.
Look for: punchlines, questions, emotional peaks, surprising statements, key points.

Return ONLY a JSON array of objects with "start" and "end" timestamps (in seconds, relative to clip start).
Each zoom should last 1-3 seconds.
Example: [{{"start": 5.2, "end": 7.0}}, {{"start": 15.5, "end": 17.5}}]

Transcript with timestamps:
{json.dumps(clip_words[:100])}"""  # Limit to avoid token issues
            )
            
            result = response.text.strip()
            if result.startswith("```json"):
                result = result[7:]
            if result.startswith("```"):
                result = result[3:]
            if result.endswith("```"):
                result = result[:-3]
            
            moments = json.loads(result.strip())
            return moments if isinstance(moments, list) else []
        except Exception as e:
            print(f"Error identifying zoom moments: {e}")
            return []

    def identify_moments(self, transcript: dict):
        response = self.gemini_client.models.generate_content(model="gemini-2.5-flash-preview-04-17", contents="""
    This is a video transcript consisting of words, along with each word's start and end time. I am looking to create clips between a minimum of 30 and maximum of 60 seconds long. The clip should never exceed 60 seconds.

    Your task is to find and extract stories, or question and their corresponding answers from the transcript.
    Each clip should begin with the question and conclude with the answer.
    It is acceptable for the clip to include a few additional sentences before a question if it aids in contextualizing the question.

    Please adhere to the following rules:
    - Ensure that clips do not overlap with one another.
    - Start and end timestamps of the clips should align perfectly with the sentence boundaries in the transcript.
    - Only use the start and end timestamps provided in the input. modifying timestamps is not allowed.
    - Format the output as a list of JSON objects, each representing a clip with 'start' and 'end' timestamps: [{"start": seconds, "end": seconds}, ...clip2, clip3]. The output should always be readable by the python json.loads function.
    - Aim to generate longer clips between 40-60 seconds, and ensure to include as much content from the context as viable.

    Avoid including:
    - Moments of greeting, thanking, or saying goodbye.
    - Non-question and answer interactions.

    If there are no valid clips to extract, the output should be an empty list [], in JSON format. Also readable by json.loads() in Python.

    The transcript is as follows:\n\n""" + str(transcript))
        print(f"Identified moments response: ${response.text}")
        return response.text

    def download_youtube_video(self, youtube_url: str, output_path: str) -> dict:
        """Download video from YouTube using yt-dlp"""
        import yt_dlp
        
        ydl_opts = {
            'format': 'best[ext=mp4]/best',
            'outtmpl': output_path,
            'max_filesize': 500 * 1024 * 1024,  # 500MB max
            'quiet': False,
            'no_warnings': False,
        }
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(youtube_url, download=True)
            return {
                'title': info.get('title', 'Unknown'),
                'duration': info.get('duration', 0),
                'id': info.get('id', 'unknown')
            }

    @modal.fastapi_endpoint(method="POST")
    def process_video(self, request: ProcessVideoRequest, token: HTTPAuthorizationCredentials = Depends(auth_scheme)):
        import cloudinary
        
        if token.credentials != os.environ["AUTH_TOKEN"]:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                                detail="Incorrect bearer token", headers={"WWW-Authenticate": "Bearer"})

        # Validate request - need either cloudinary_public_id or youtube_url
        if not request.cloudinary_public_id and not request.youtube_url:
            raise HTTPException(status_code=400, detail="Either cloudinary_public_id or youtube_url is required")

        run_id = str(uuid.uuid4())
        base_dir = pathlib.Path("/tmp") / run_id
        base_dir.mkdir(parents=True, exist_ok=True)
        video_path = base_dir / "input.mp4"
        
        # Determine s3_key for output naming
        if request.youtube_url:
            s3_key = f"youtube/{run_id}"
        else:
            s3_key = request.cloudinary_public_id

        # Download video from YouTube or Cloudinary
        if request.youtube_url:
            print(f"Downloading from YouTube: {request.youtube_url}")
            try:
                video_info = self.download_youtube_video(request.youtube_url, str(video_path))
                print(f"Downloaded YouTube video: {video_info['title']} ({video_info['duration']}s)")
                
                # Check duration (max 60 minutes)
                if video_info['duration'] > 3600:
                    raise HTTPException(status_code=400, detail="Video exceeds maximum duration of 60 minutes")
            except Exception as e:
                print(f"Error downloading from YouTube: {e}")
                raise HTTPException(status_code=400, detail=f"Failed to download YouTube video: {str(e)}")
        else:
            # Download from Cloudinary
            try:
                video_url = cloudinary.CloudinaryVideo(s3_key).build_url()
                response = requests.get(video_url, stream=True)
                response.raise_for_status()
                
                with open(video_path, 'wb') as f:
                    for chunk in response.iter_content(chunk_size=8192):
                        f.write(chunk)
                
                print(f"Downloaded video from Cloudinary: {s3_key}")
            except Exception as e:
                print(f"Error downloading from Cloudinary: {e}")
                raise

        # 1. Transcription
        transcript_segments_json = self.transcribe_video(base_dir, video_path)
        transcript_segments = json.loads(transcript_segments_json)

        # 2. Identify moments for clips
        print("Identifying clip moments")
        identified_moments_raw = self.identify_moments(transcript_segments)

        cleaned_json_string = identified_moments_raw.strip()
        if cleaned_json_string.startswith("```json"):
            cleaned_json_string = cleaned_json_string[len("```json"):].strip()
        if cleaned_json_string.endswith("```"):
            cleaned_json_string = cleaned_json_string[:-len("```")].strip()

        clip_moments = json.loads(cleaned_json_string)
        if not clip_moments or not isinstance(clip_moments, list):
            print("Error: Identified moments is not a list")
            clip_moments = []

        print(clip_moments)

        # 3. Process clips with options
        processing_options = {
            "remove_silences": request.remove_silences,
            "remove_filler_words": request.remove_filler_words,
            "transition_style": request.transition_style,
            "auto_zoom": request.auto_zoom,
            "zoom_intensity": request.zoom_intensity,
            "auto_censor": request.auto_censor,
            "caption_style": request.caption_style
        }
        
        processed_clips = []
        for index, moment in enumerate(clip_moments[:5]):
            if "start" in moment and "end" in moment:
                print("Processing clip" + str(index) + " from " +
                      str(moment["start"]) + " to " + str(moment["end"]))
                
                # Identify zoom moments if auto_zoom is enabled
                zoom_moments = []
                if request.auto_zoom:
                    try:
                        zoom_moments = self.identify_zoom_moments(transcript_segments, moment["start"], moment["end"])
                        print(f"Identified {len(zoom_moments)} zoom moments for clip {index}")
                    except Exception as e:
                        print(f"Warning: Could not identify zoom moments: {e}")
                
                clip_result = process_clip(base_dir, video_path, s3_key,
                             moment["start"], moment["end"], index, transcript_segments, processing_options, zoom_moments)
                
                # Get transcript text for this clip
                clip_transcript = " ".join([
                    seg.get("word", "") for seg in transcript_segments
                    if seg.get("start", 0) >= moment["start"] and seg.get("end", 0) <= moment["end"]
                ])
                
                # Generate AI titles and descriptions
                titles = self.generate_titles(clip_transcript)
                description_data = self.generate_description_and_hashtags(clip_transcript)
                
                # Get transcript segments for this clip (for text-based editing)
                clip_segments = [
                    {"word": seg.get("word", ""), "start": seg.get("start", 0), "end": seg.get("end", 0)}
                    for seg in transcript_segments
                    if seg.get("start", 0) >= moment["start"] and seg.get("end", 0) <= moment["end"]
                ]
                
                if clip_result:
                    clip_result["titles"] = titles
                    clip_result["caption"] = description_data.get("caption", "")
                    clip_result["hashtags"] = description_data.get("hashtags", [])
                    clip_result["transcript"] = clip_transcript
                    clip_result["transcript_segments"] = clip_segments
                    clip_result["original_start"] = moment["start"]
                    clip_result["original_end"] = moment["end"]
                    clip_result["source_video_key"] = s3_key
                    processed_clips.append(clip_result)

        if base_dir.exists():
            print(f"Cleaning up temp dir after {base_dir}")
            shutil.rmtree(base_dir, ignore_errors=True)
        
        return {"clips": processed_clips, "total_clips": len(processed_clips)}

    @modal.fastapi_endpoint(method="POST")
    def edit_clip(self, request: TextEditRequest, token: HTTPAuthorizationCredentials = Depends(auth_scheme)):
        """Re-render a clip with text-based edits (remove selected words/segments)"""
        import cloudinary
        import cloudinary.uploader
        
        if token.credentials != os.environ["AUTH_TOKEN"]:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                                detail="Incorrect bearer token", headers={"WWW-Authenticate": "Bearer"})

        # Validate we have segments to keep
        kept_segments = [s for s in request.segments if s.keep]
        if not kept_segments:
            raise HTTPException(status_code=400, detail="At least one segment must be kept")

        run_id = str(uuid.uuid4())
        base_dir = pathlib.Path("/tmp") / run_id
        base_dir.mkdir(parents=True, exist_ok=True)
        
        # Download original clip from Cloudinary
        try:
            video_url = cloudinary.CloudinaryVideo(request.cloudinary_public_id).build_url()
            input_path = base_dir / "input.mp4"
            
            response = requests.get(video_url, stream=True)
            response.raise_for_status()
            
            with open(input_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            
            print(f"Downloaded clip from Cloudinary: {request.cloudinary_public_id}")
        except Exception as e:
            print(f"Error downloading clip: {e}")
            raise HTTPException(status_code=400, detail=f"Failed to download clip: {str(e)}")

        # Convert segments to dict format
        segments_dict = [
            {"word": s.word, "start": s.start, "end": s.end, "keep": s.keep}
            for s in request.segments
        ]

        # Render edited video
        output_path = base_dir / "edited.mp4"
        final_path = base_dir / "final.mp4"
        
        try:
            render_from_segments(str(input_path), str(output_path), segments_dict, request.caption_style)
            
            # Apply transition
            apply_transition(str(output_path), str(final_path), request.transition_style)
            
            print("Rendered edited clip successfully")
        except Exception as e:
            print(f"Error rendering edited clip: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to render edited clip: {str(e)}")

        # Upload to Cloudinary with new ID
        try:
            new_public_id = f"{request.cloudinary_public_id}_edited_{run_id[:8]}"
            result = cloudinary.uploader.upload(
                str(final_path),
                resource_type="video",
                public_id=new_public_id,
                folder="mylo-videos",
                overwrite=True
            )
            
            print(f"Uploaded edited clip: {result['public_id']}")
            
            # Generate new transcript text from kept segments
            new_transcript = " ".join([s.word for s in request.segments if s.keep])
            
            # Generate new titles and description
            titles = self.generate_titles(new_transcript)
            description_data = self.generate_description_and_hashtags(new_transcript)
            
            # Cleanup
            if base_dir.exists():
                shutil.rmtree(base_dir, ignore_errors=True)
            
            return {
                "cloudinary_public_id": result['public_id'],
                "cloudinary_url": result.get('secure_url', ''),
                "transcript": new_transcript,
                "titles": titles,
                "caption": description_data.get("caption", ""),
                "hashtags": description_data.get("hashtags", [])
            }
        except Exception as e:
            print(f"Error uploading edited clip: {e}")
            if base_dir.exists():
                shutil.rmtree(base_dir, ignore_errors=True)
            raise HTTPException(status_code=500, detail=f"Failed to upload edited clip: {str(e)}")


@app.local_entrypoint()
def main():
    import requests

    mylo_clipper = MyloVideoClipper()

    url = mylo_clipper.process_video.web_url

    payload = {
        "s3_key": "test2/mi630min.mp4"
    }

    headers = {
        "Content-Type": "application/json",
        "Authorization": "Bearer 123123"
    }

    response = requests.post(url, json=payload,
                             headers=headers)
    response.raise_for_status()
    result = response.json()
    print(result)
