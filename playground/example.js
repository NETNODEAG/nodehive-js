
import { DrupalJsonApiParams } from 'drupal-jsonapi-params';

const module = await import('../src/NodeHiveClient.js');
    const NodeHiveClient = module.NodeHiveClient;
const client = new NodeHiveClient('https://www.netnode.ch');

client.getContentTypes().then(data => {
    console.log(data);
});

/*
const contentType = 'article';
const apiParams = new DrupalJsonApiParams();
apiParams.addFilter('status', '1').addPageLimit(10);

// Call getNodes on the NodeHive instance
client.getNodes(contentType, apiParams).then(nodes => {
    //console.log(nodes);
});

client.router('/node/104').then(re => {
    console.log(re);
});

const uuid = '273abacf-8a3d-44ad-8a11-e119a73a7145' 

// Optionally, create an instance of DrupalJsonApiParams to customize the query
const params = new DrupalJsonApiParams();
params.addFields('node--article', ['title', 'body', 'field_custom']);
params.addInclude(['field_media.field_media_image'])

// Retrieve the node by ID
client.getNode(uuid, 'page', params)
    .then(node => {
        console.log(node);
    })
    .catch(error => {
        console.error('Error fetching node:', error);
    });*/