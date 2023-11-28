import { DrupalParagraph } from 'next-drupal';

import { isParagraphType, paragraphTypes } from './paragraphs';

interface ParagraphProps {
  paragraph: DrupalParagraph;
}
export default function Paragraph({ paragraph }: ParagraphProps) {
  if (isParagraphType(paragraph.type)) {
    const ParagraphInstance = paragraphTypes[paragraph.type];
    return (
      <div
        data-nodehive-enable="true"
        data-nodehive-type="paragraph"
        data-nodehive-parent_id={paragraph.parent_id}
        data-nodehive-id={paragraph.meta.drupal_internal__target_id}
        data-nodehive-uuid={paragraph.id}
      > 
        <ParagraphInstance paragraph={paragraph} />
      </div>
    );
  } else {
    return (
      <div className="relative m-10 rounded-xl border-4 border-slate-300 p-4">
        <span className="font-bold">{paragraph.type}</span> missing
        <details>
          <summary>Data structure</summary>
          <pre className="rounded-md bg-black p-8 text-xs text-slate-50">
            {JSON.stringify(paragraph, null, 2)}
          </pre>
        </details>
      </div>
    )
  }
  return null;
}
