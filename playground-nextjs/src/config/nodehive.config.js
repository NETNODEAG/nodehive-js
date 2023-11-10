export const NodeHiveConfig = {
    'entities': {
        'node-page' : {
            'addFields': [
                'title',
                'field_paragraphs',
                'field_teaser'
            ],
            'addInclude': [
                'field_paragraphs',
            ],
        },
        'node-article' : {
            'include': [
                'field_paragraphs',
                'field_paragraphs.field_media'
            ]
        }
    },

}