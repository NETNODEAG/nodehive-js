import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { DrupalJsonApiParams } from 'drupal-jsonapi-params';

import { NodeHiveConfig } from '@/config/nodehive.config';
import { NodeHiveClient } from '../../../../src/NodeHiveClient';
import NodePage from '@/components/node/node-page/NodePage';

export default async function RootPage() {
  // The getResource() function is used to retrieve a resource, utilizing its unique slug as the identifier.
  //const entity = await getResource(STARTPAGE_SLUG);

  const client = new NodeHiveClient(
    process.env.NEXT_PUBLIC_DRUPAL_REST_BASE_URL,
    NodeHiveConfig
  );

  const apiParams = new DrupalJsonApiParams();
    //apiParams.addFields('node-page', ['title']);
    //apiParams.addInclude(['field_paragraphs']);
    //apiParams.addFieldse('field_paragraphs');


  const entity = await client.getNode('a539b950-fe77-40c3-b2f7-a1fe5382a057', 'page', 'en', apiParams)

 
 
  //console.log(data)

  //console.log(entity);
  return (
    <>{entity?.data?.type === 'node--page' && <NodePage node={entity.data} />}</>
  );

}
