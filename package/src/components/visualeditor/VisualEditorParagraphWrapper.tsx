export function VisualEditorParagraphWrapper({
  entity,
  enable = true,
  editmode = 'sidebar',
  children,
}) {

  const nodehiveEnable = enable.toString();
  const nodehiveEditMode = editmode;

  const dynamicId = `node-${entity.meta.drupal_internal__target_id}`;

  if (entity?.paragraph_type != '') {
    return (
      <div
        id={dynamicId}
        data-nodehive-enable={nodehiveEnable}
        data-nodehive-editmode={nodehiveEditMode} // edit-form, sidebar, modal, inline
        data-nodehive-type="paragraph"
        data-nodehive-parent_id={entity.parent_id}
        data-nodehive-id={entity.meta.drupal_internal__target_id}
        data-nodehive-uuid={entity.id}
      >
        {children}
      </div>
    );
  } else {
    return (
      <div>
        no visual editor
        {children}
      </div>
    );
  }
}
