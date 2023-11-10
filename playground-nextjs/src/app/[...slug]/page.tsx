import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { DrupalJsonApiParams } from 'drupal-jsonapi-params';

import { NodeHiveConfig } from '@/config/nodehive.config';
import NodePage from '@/components/node/node-page/NodePage';
import Paragraph from '@/components/paragraph/Paragraph';
import { NodeHiveClient } from '../../../../src/NodeHiveClient';

interface PageProps {
  params: { slug: Array<string> };
}

export default async function Page({ params }: PageProps) {
  const { slug } = params;
  const slugstring = slug.join('/');
  console.log(slug);

  const client = new NodeHiveClient(
    process.env.NEXT_PUBLIC_DRUPAL_REST_BASE_URL,
    NodeHiveConfig
  );

  const apiParams = new DrupalJsonApiParams();
  apiParams.addInclude(['field_paragraphs']);



  const entity = await client.getResourceBySlug(slugstring);

  //const menu = await client.getMenuItems('nodehiveapp-com-main');

  console.log(entity);
  return (
    <>{entity?.data?.type === 'node--page' && <NodePage node={entity.data} />}</>
  );
}
