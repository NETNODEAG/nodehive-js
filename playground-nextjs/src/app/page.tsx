import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { DrupalJsonApiParams } from 'drupal-jsonapi-params';

import { NodeHiveConfig } from '@/config/nodehive.config';
import { NodeHiveClient } from '../../../src/NodeHiveClient';
import NodePage from '@/components/node/node-page/NodePage';

export default async function RootPage() {


  const client = new NodeHiveClient(
    process.env.NEXT_PUBLIC_DRUPAL_REST_BASE_URL,
    NodeHiveConfig
  );

  const entity = await client.getResourceBySlug(
    process.env.NODEHIVE_STARTPAGE_SLUG
  );

  //const apiParams = new DrupalJsonApiParams();
  //apiParams.addFilter('status', '1').addPageLimit(10);
  //const data = await client.getNodes('article');

  //console.log(data)

  return (
    <>{entity?.data?.type === 'node--page' && <NodePage node={entity.data} />}</>
  );
}
