"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Mail } from "lucide-react";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";

interface FaqSectionProps extends React.HTMLAttributes<HTMLElement> {
  title: string;
  description?: string;
  items: {
    question: string;
    answer: string;
  }[];
  contactInfo?: {
    title: string;
    description: string;
    buttonText: string;
    onContact?: () => void;
  };
}

const FaqSection = React.forwardRef<HTMLElement, FaqSectionProps>(
  ({ className, title, description, items, contactInfo, ...props }, ref) => {
    return (
      <section
        ref={ref}
        className={cn(
          "py-12 w-full bg-gradient-to-b from-transparent via-gray-50/50 to-transparent",
          className
        )}
        {...props}
      >
        <div className="container mx-auto max-w-3xl px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mx-auto text-center mb-10"
          >
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#ffc247]">
              FAQ
            </p>
            <h2 className="text-3xl font-bold mb-3 text-gray-900 sm:text-4xl">
              {title}
            </h2>
            {description && (
              <p className="font-subtext text-base text-gray-600">{description}</p>
            )}
          </motion.div>

          {/* FAQ Items */}
          <div className="max-w-2xl mx-auto space-y-3">
            {items.map((item, index) => (
              <FaqItem
                key={index}
                question={item.question}
                answer={item.answer}
                index={index}
              />
            ))}
          </div>

          {/* Contact Section */}
          {contactInfo && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="max-w-md mx-auto mt-10 p-6 rounded-2xl bg-white border border-gray-200 text-center shadow-sm"
            >
              <div className="inline-flex items-center justify-center p-2 rounded-full bg-gradient-to-br from-[#ffc247] to-[#00ffe5] mb-4">
                <Mail className="h-4 w-4 text-gray-900" />
              </div>
              <p className="text-sm font-semibold text-gray-900 mb-1">
                {contactInfo.title}
              </p>
              <p className="font-subtext text-xs text-gray-600 mb-4">
                {contactInfo.description}
              </p>
              <Button
                size="sm"
                onClick={contactInfo.onContact}
                className="bg-[#ffc247] text-gray-900 hover:bg-[#ffb020]"
              >
                {contactInfo.buttonText}
              </Button>
            </motion.div>
          )}
        </div>
      </section>
    );
  }
);
FaqSection.displayName = "FaqSection";

// Internal FaqItem component
const FaqItem = React.forwardRef<
  HTMLDivElement,
  {
    question: string;
    answer: string;
    index: number;
  }
>((props, ref) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const { question, answer, index } = props;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.1 }}
      className={cn(
        "group rounded-2xl",
        "transition-all duration-200 ease-in-out",
        "border border-gray-200 bg-white shadow-sm",
        isOpen
          ? "bg-gradient-to-br from-white via-gray-50/50 to-white"
          : "hover:shadow-md"
      )}
    >
      <Button
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-5 h-auto justify-between hover:bg-transparent"
      >
        <h3
          className={cn(
            "text-base font-semibold transition-colors duration-200 text-left",
            "text-gray-700",
            isOpen && "text-gray-900"
          )}
        >
          {question}
        </h3>
        <motion.div
          animate={{
            rotate: isOpen ? 180 : 0,
            scale: isOpen ? 1.1 : 1,
          }}
          transition={{ duration: 0.2 }}
          className={cn(
            "p-0.5 rounded-full flex-shrink-0",
            "transition-colors duration-200",
            isOpen ? "text-[#ffc247]" : "text-gray-400"
          )}
        >
          <ChevronDown className="h-5 w-5" />
        </motion.div>
      </Button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{
              height: "auto",
              opacity: 1,
              transition: { duration: 0.2, ease: "easeOut" },
            }}
            exit={{
              height: 0,
              opacity: 0,
              transition: { duration: 0.2, ease: "easeIn" },
            }}
          >
            <div className="px-6 pb-5 pt-0">
              <motion.p
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                className="font-subtext text-sm text-gray-600 leading-relaxed"
              >
                {answer}
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});
FaqItem.displayName = "FaqItem";

export { FaqSection };
