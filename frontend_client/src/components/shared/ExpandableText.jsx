import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { countWords } from "../../utils/locationHelpers";

const ExpandableText = ({ text, wordLimit = 120, resetKey }) => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const shouldTruncate = countWords(text) > wordLimit;

  useEffect(() => setExpanded(false), [resetKey]);

  return (
    <div>
      <p
        className={`text-gray-700 leading-relaxed text-[15px] whitespace-pre-line ${!expanded && shouldTruncate ? "line-clamp-5" : ""}`}
      >
        {text}
      </p>
      {shouldTruncate && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-2 pl-0 text-sm font-medium text-gray-600 underline hover:text-gray-500 transition-colors"
        >
          {expanded ? t("restaurant.show_less") : t("restaurant.show_more")}
        </button>
      )}
    </div>
  );
};

export default ExpandableText;
