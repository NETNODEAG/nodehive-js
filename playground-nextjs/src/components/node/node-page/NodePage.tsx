import { DrupalNode, DrupalParagraph } from 'next-drupal';

import Paragraph from '@/components/paragraph/Paragraph';

interface NodePageProps {
  node: DrupalNode;
}

export default function NodePage({ node }: NodePageProps) {
  const title = node.title;
  const paragraphs = node.field_paragraphs;

  //console.log(paragraphs)
  const stringifiedEntity = JSON.stringify(node, null, 2);
  return (
    <article data-node-type="Page" className="container mx-auto">
      <h1 className="mb-10 mt-10 text-2xl">{title}</h1>

      {!node.status && (
        <div
          className="mb-5 border-l-4 border-yellow-500 bg-yellow-100 p-4 text-yellow-700"
          role="alert"
        >
          <p className="font-bold">Info</p>
          <p>
            [{node.node_type.meta.drupal_internal__target_id}] {title} is
            unpublished.
          </p>
        </div>
      )}

      <details open>
        <summary>JSON Output</summary>
        <pre className="rounded-md bg-black p-8 text-xs text-slate-50">
          {stringifiedEntity}
        </pre>
      </details>

      {Array.isArray(paragraphs) &&
        paragraphs?.map((paragraph: DrupalParagraph) => {
          return (
            <div className=" bottom-2 mb-10 mt-10 border border-blue-700 p-4">
              {' '}
              {paragraph.type}
              <br />
              {paragraph.id}
              <Paragraph key={paragraph.id} paragraph={paragraph} />
            </div>
          );
        })}
    </article>
  );
}
