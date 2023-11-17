export const NodeHiveConfig = {

    'entities': {
        'node-page' : {
            'addFilter': [
                ['status', '1'],
                ['nodehive_space.meta.drupal_internal__target_id', process.env.NODEHIVE_SPACE_ID]
            ],
            'addFields': [
                'title',
                'field_paragraphs',
                'field_teaser',
                'field_media',
            ],
            'addInclude': [
                'field_paragraphs',
                'field_media',
                'field_media.field_media_image',
                'field_paragraphs.field_nested_paragraph'
            ],
        }
    },

}