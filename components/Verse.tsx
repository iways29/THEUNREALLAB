import BlurText from "@/components/reactbits/BlurText";

/** The gold-ruled verse block used under The Promise, The Practice and The Fund. */
export default function Verse({
  lines,
  gloss,
  source,
}: {
  lines: string[];
  gloss: string;
  source: string;
}) {
  return (
    <div className="verse">
      <div className="verse__deva">
        {lines.map((line, i) => (
          <span key={line}>
            {i > 0 ? <br /> : null}
            {line}
          </span>
        ))}
      </div>
      <BlurText as="div" className="verse__gloss" delay={34}>
        {gloss}
      </BlurText>
      <div className="verse__source">{source}</div>
    </div>
  );
}
