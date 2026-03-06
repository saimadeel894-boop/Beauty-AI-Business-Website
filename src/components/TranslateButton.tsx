import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Languages, Loader2, X } from "lucide-react";
import { useTranslation, LANGUAGES, type SupportedLanguage } from "@/hooks/useTranslation";

interface TranslateButtonProps {
  text: string;
  context?: "message" | "rfq_description" | "product_specification" | "general";
  size?: "sm" | "icon" | "default";
  onTranslated?: (translated: string, lang: SupportedLanguage) => void;
}

export function TranslateButton({ text, context = "general", size = "sm", onTranslated }: TranslateButtonProps) {
  const { translate, translating } = useTranslation();
  const [translated, setTranslated] = useState<string | null>(null);
  const [activeLang, setActiveLang] = useState<SupportedLanguage | null>(null);
  const [open, setOpen] = useState(false);

  const handleTranslate = async (lang: SupportedLanguage) => {
    setOpen(false);
    const result = await translate(text, lang, context);
    if (result) {
      setTranslated(result);
      setActiveLang(lang);
      onTranslated?.(result, lang);
    }
  };

  const clearTranslation = () => {
    setTranslated(null);
    setActiveLang(null);
  };

  if (translated) {
    return (
      <div className="mt-1.5 rounded-md bg-secondary/60 px-3 py-2 relative">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-medium text-muted-foreground flex items-center gap-1">
            <Languages className="h-3 w-3" />
            {LANGUAGES.find(l => l.code === activeLang)?.flag} Translated
          </span>
          <Button variant="ghost" size="icon" className="h-4 w-4" onClick={clearTranslation}>
            <X className="h-3 w-3" />
          </Button>
        </div>
        <p className="text-sm">{translated}</p>
      </div>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size={size === "icon" ? "icon" : "sm"}
          className={size === "icon" ? "h-6 w-6" : "h-6 px-2 text-[10px] gap-1"}
          disabled={translating}
        >
          {translating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Languages className="h-3 w-3" />}
          {size !== "icon" && "Translate"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-40 p-1" align="start">
        {LANGUAGES.map((lang) => (
          <Button
            key={lang.code}
            variant="ghost"
            size="sm"
            className="w-full justify-start text-xs gap-2"
            onClick={() => handleTranslate(lang.code)}
          >
            <span>{lang.flag}</span> {lang.label}
          </Button>
        ))}
      </PopoverContent>
    </Popover>
  );
}

interface InlineTranslateProps {
  text: string;
  context?: "message" | "rfq_description" | "product_specification" | "general";
}

export function InlineTranslate({ text, context = "general" }: InlineTranslateProps) {
  return (
    <div className="inline-flex">
      <TranslateButton text={text} context={context} size="icon" />
    </div>
  );
}
