import { DrupalNode, DrupalParagraph } from 'next-drupal';

import Paragraph from '@/components/paragraph/Paragraph';

interface NodePageProps {
  node: DrupalNode;
}

export default function NodePage({ node }: NodePageProps) {
  const title = node.title;
  const paragraphs = node.field_paragraphs;

  console.log(paragraphs)
  const stringifiedEntity = JSON.stringify(node, null, 2);
  return (
    <article data-node-type="Page" className="container mx-auto">
      <h1 className="text-2xl mb-10 mt-10">{title}</h1>

      
      <details open>
        <summary>JSON Output</summary>
        <pre className='bg-black text-slate-50 p-8 text-xs rounded-md'>{stringifiedEntity}</pre>
      </details>

      {Array.isArray(paragraphs) &&
        paragraphs?.map((paragraph: DrupalParagraph) => {
          return <div className=" mb-10 mt-10 bottom-2 border border-blue-700 p-4"> {paragraph.type}<br />{paragraph.id}
            {/*<Paragraph key={paragraph.id} paragraph={paragraph} />*/}
          </div>
        })}
    </article>
  );
}
