export default function SplitFlapText({ text, className = "", tileClassName = "" }) {
  return (
    <span className={`split-flap ${className}`}>
      {text.split("").map((char, i) => (
        <span key={i} className={`split-flap-tile ${tileClassName}`}>
          {char === " " ? " " : char}
        </span>
      ))}
    </span>
  );
}
