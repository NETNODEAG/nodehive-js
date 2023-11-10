export const NodeHiveConfig = {
    'entities': {
        'node-page' : {
            'addFields': [
                'title',
                'field_paragraphs',
                'field_teaser',
                'field_media',
                'field_media.field_media_image'
            ],
            'addInclude': [
                'field_paragraphs',
                'field_media',
                'field_media.field_media_image'
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