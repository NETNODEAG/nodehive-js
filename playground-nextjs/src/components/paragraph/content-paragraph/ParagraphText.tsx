import { DrupalParagraph } from 'next-drupal';

export interface ParagraphTextProps {
  paragraph: DrupalParagraph;
}

export default function ParagraphText({ paragraph }: ParagraphTextProps) {
  // Extracting title and text from the paragraph
  const text = paragraph?.field_text?.processed;
  const title = paragraph?.field_title;

  return (
    <section data-paragraph-type="Text">

      {title && <h2 className="text-xl">{title}</h2>}

      {text && (
        <div
          className="prose"
          dangerouslySetInnerHTML={{
            __html: text,
          }}
        />
      )}

      
    </section>
  );
}
