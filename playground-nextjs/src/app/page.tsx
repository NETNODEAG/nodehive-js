import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

import { NodeHiveClient } from '../../../src/NodeHiveClient';
import { DrupalJsonApiParams } from 'drupal-jsonapi-params';




export default async function RootPage() {
    // The getResource() function is used to retrieve a resource, utilizing its unique slug as the identifier.
    //const entity = await getResource(STARTPAGE_SLUG);
    

    

    const client = new NodeHiveClient(process.env.NEXT_PUBLIC_DRUPAL_REST_BASE_URL);
    
    const data = await client.getResourceBySlug(process.env.NODEHIVE_STARTPAGE_SLUG)


    //const apiParams = new DrupalJsonApiParams();
    //apiParams.addFilter('status', '1').addPageLimit(10);
    //const data = await client.getNodes('article');

    //console.log(data)
    
    return <h1 className="text-2xl">{data.data.title}</h1>;
  }