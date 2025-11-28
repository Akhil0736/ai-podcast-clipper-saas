# Design Document

## Overview

This design document outlines the technical approach for rebranding the AI Podcast Clipper application to "Mylo". The rebranding is a systematic find-and-replace operation across the entire codebase, with special attention to infrastructure naming, environment variables, and deployment configurations. The goal is to update all brand references while maintaining 100% functional compatibility with the existing system.

## Architecture

The rebranding affects three main architectural layers:

1. **Application Layer**: Source code files (Python, TypeScript, React components)
2. **Configuration Layer**: Environment variables, package metadata, build configurations
3. **Infrastructure Layer**: Modal app names, S3 bucket references, secret names

The rebranding strategy uses a phased approach:
- Phase 1: Scan and identify all references
- Phase 2: Execute systematic replacements
- Phase 3: Verify builds and functionality
- Phase 4: Document migration requirements

## Components and Interfaces

### Component 1: Code Scanner
**Purpose**: Identify all occurrences of brand-related strings across the codebase

**Interface**:
```typescript
interface ScanResult {
  filePath: string;
  lineNumber: number;
  matchedText: string;
  context: string;
}

function scanCodebase(patterns: string[]): ScanResult[]
```

**Implementation**: Uses `grepSearch` tool to find patterns across file types

### Component 2: String Replacer
**Purpose**: Execute systematic string replacements in files

**Interface**:
```typescript
interface ReplacementRule {
  pattern: string;
  replacement: string;
  fileTypes: string[];
  caseSensitive: boolean;
}

function applyReplacements(rules: ReplacementRule[]): FileChange[]
```

**Implementation**: Uses `strReplace` tool for precise line-by-line replacements

### Component 3: Directory Renamer
**Purpose**: Rename directories from old brand to new brand

**Interface**:
```bash
function renameDirectory(oldPath: string, newPath: string): void
```

**Implementation**: Uses bash `mv` command to rename directories

### Component 4: Verification Engine
**Purpose**: Verify no brand references remain and builds succeed

**Interface**:
```typescript
interface VerificationResult {
  remainingReferences: ScanResult[];
  buildSuccess: boolean;
  errors: string[];
}

function verifyRebranding(): VerificationResult
```

**Implementation**: Combines grep searches with build commands

## Data Models

### Replacement Rules Model
```typescript
const REPLACEMENT_RULES = [
  {
    pattern: "ai-podcast-clipper",
    replacement: "mylo",
    fileTypes: ["*.py", "*.ts", "*.tsx", "*.json", "*.md"],
    caseSensitive: true
  },
  {
    pattern: "AI Podcast Clipper",
    replacement: "Mylo",
    fileTypes: ["*.py", "*.ts", "*.tsx", "*.md"],
    caseSensitive: true
  },
  {
    pattern: "podcast clipper",
    replacement: "video clipper",
    fileTypes: ["*.py", "*.ts", "*.tsx", "*.md"],
    caseSensitive: false
  }
]
```

### File Change Log Model
```typescript
interface FileChange {
  filePath: string;
  changeType: "content" | "rename" | "delete";
  replacements: Array<{
    lineNumber: number;
    oldText: string;
    newText: string;
  }>;
}
```

### Migration Checklist Model
```typescript
interface MigrationTask {
  category: "environment" | "infrastructure" | "deployment";
  service: string;
  task: string;
  completed: boolean;
  priority: "critical" | "high" | "medium";
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Complete brand removal
*For any* file in the codebase (excluding .git and node_modules), after rebranding is complete, searching for "podcast" should return zero matches in code files
**Validates: Requirements 1.1, 1.2, 1.3**

### Property 2: Package name consistency
*For any* package.json file in the project, the "name" field should contain "mylo" and not contain "podcast"
**Validates: Requirements 5.1, 5.2, 5.3**

### Property 3: Modal configuration consistency
*For any* Modal app initialization in Python files, the app name should be "mylo" and volume names should use "mylo-" prefix
**Validates: Requirements 2.1, 2.2, 2.3**

### Property 4: S3 bucket reference indirection
*For any* S3 client operation in the codebase, the bucket name should be read from an environment variable, not hardcoded
**Validates: Requirements 3.1, 3.2, 3.3**

### Property 5: Documentation brand consistency
*For any* README or documentation file, references to the application should use "Mylo" and describe it as a "video clipper" not "podcast clipper"
**Validates: Requirements 6.1, 6.2, 6.3**

### Property 6: Build success preservation
*For any* valid build command (npm run build, tsc --noEmit), after rebranding, the build should complete successfully with zero errors
**Validates: Requirements 1.1, 1.2, 1.3, 5.1**

### Property 7: Directory naming consistency
*For any* project directory name, it should use "mylo" naming convention and not contain "podcast"
**Validates: Requirements 1.5**

### Property 8: Environment variable documentation completeness
*For any* environment variable required by the application, it should be documented in .env.example with appropriate naming
**Validates: Requirements 4.1, 4.2, 9.2**

## Error Handling

### Scan Phase Errors
- **Missing files**: If expected files don't exist, log warning and continue
- **Permission errors**: Report files that cannot be read and skip them
- **Binary files**: Automatically skip binary files during text search

### Replacement Phase Errors
- **File locked**: Retry up to 3 times with 1s delay
- **Replacement not found**: Log warning if expected text not found at specified line
- **Syntax errors after replacement**: Rollback file and report error

### Verification Phase Errors
- **Build failures**: Report exact error message and affected files
- **Remaining references**: List all files still containing old brand references
- **Type errors**: Report TypeScript compilation errors with file and line number

### Rollback Strategy
- Keep backup of original files before modification
- If critical error occurs, restore from backup
- Provide manual rollback instructions in migration checklist

## Testing Strategy

### Manual Verification Tests
Since this is a one-time rebranding operation, we'll use manual verification:

1. **Visual inspection**: Review key files for correct replacements
2. **Build verification**: Run build commands and verify success
3. **Search verification**: Run grep commands to find remaining references
4. **Functional testing**: Test upload flow in development environment

### Verification Commands
```bash
# Search for remaining "podcast" references
grep -r "podcast" . --include="*.py" --include="*.ts" --include="*.tsx" --include="*.json" --exclude-dir=node_modules --exclude-dir=.git

# Verify frontend builds
cd ai-podcast-clipper-frontend && npm run build

# Verify TypeScript compilation
cd ai-podcast-clipper-frontend && npx tsc --noEmit

# Verify Python syntax
python -m py_compile ai-podcast-clipper-backend/main.py
```

### Expected Results
- Grep search: 0 matches in code files (may have matches in .git history)
- Frontend build: Success with 0 errors
- TypeScript check: 0 errors
- Python syntax: No syntax errors

## Implementation Phases

### Phase 1: Discovery (Scan)
1. Search for all variations of "podcast" in codebase
2. Categorize findings by file type
3. Generate comprehensive list of files requiring changes
4. Estimate total replacements needed

### Phase 2: Execution (Replace)
1. Rename directories first (to avoid path confusion)
2. Update package.json files (establishes new package names)
3. Update Python backend files (Modal app, S3 references)
4. Update TypeScript frontend files (imports, components)
5. Update configuration files (.env.example, README)
6. Update documentation and comments

### Phase 3: Verification (Test)
1. Run grep search to find remaining references
2. Execute build commands for frontend
3. Check TypeScript compilation
4. Verify Python syntax
5. Review critical files manually

### Phase 4: Documentation (Checklist)
1. Generate file change log
2. Create environment variable migration list
3. Document infrastructure changes needed
4. Provide deployment commands
5. Create troubleshooting guide

## Deployment Considerations

### Pre-Deployment Checklist
- [ ] All code changes committed to version control
- [ ] Backup of current production environment
- [ ] New S3 bucket created: `mylo-videos`
- [ ] Modal secrets updated with new names
- [ ] Environment variables prepared for all services

### Deployment Order
1. **AWS S3**: Create new bucket `mylo-videos`, configure CORS
2. **Modal**: Deploy backend with new app name `mylo`
3. **Database**: No schema changes needed (models are generic)
4. **Vercel**: Deploy frontend with updated environment variables
5. **Inngest**: Update event names if they reference old brand
6. **Stripe**: Update product descriptions (optional)

### Post-Deployment Verification
1. Test video upload flow
2. Verify Modal processing works
3. Check S3 file storage
4. Test clip generation end-to-end
5. Verify Stripe payment flow

### Rollback Plan
If critical issues occur:
1. Revert git commits
2. Restore previous Modal deployment
3. Point frontend to old backend URL
4. Keep old S3 bucket active during transition
5. Estimated rollback time: 15 minutes

## Migration Checklist Template

The implementation will generate a detailed checklist covering:

### Code Changes
- List of all modified files with line counts
- Summary by file type (Python, TypeScript, Config)
- Total replacement count

### Environment Variables
- Modal deployment variables
- Vercel deployment variables
- AWS configuration
- Stripe configuration
- Inngest configuration

### Infrastructure Updates
- S3 bucket creation steps
- Modal app deployment commands
- DNS/domain updates (if applicable)
- CDN cache invalidation (if applicable)

### Testing Checklist
- Local development testing
- Build verification
- Deployment testing
- End-to-end flow testing
- Payment flow testing

## Risk Assessment

### Low Risk Changes
- README and documentation updates
- Comment updates in code
- Package.json name changes (doesn't affect runtime)

### Medium Risk Changes
- Directory renames (may affect imports)
- Environment variable name changes (requires coordination)
- Modal app name changes (requires redeployment)

### High Risk Changes
- S3 bucket name changes (requires data migration or dual-bucket support)
- API endpoint URL changes (requires frontend-backend coordination)

### Mitigation Strategies
- Use environment variables for all infrastructure names (enables easy rollback)
- Keep old S3 bucket active during transition
- Deploy backend before frontend
- Test thoroughly in development before production deployment
