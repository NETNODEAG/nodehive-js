export function VisualEditorNodeWrapper({
  entity,
  enable = true,
  editmode = 'edit-form',
  children,
}) {

  const nodehiveEnable = enable.toString();
  const nodehiveEditMode = editmode;

  const dynamicId = `node-${entity.data.drupal_internal__nid}`;

  if (entity.data?.node_type) {
    return (
      <div
        id={dynamicId}
        data-nodehive-enable={nodehiveEnable}
        data-nodehive-editmode={nodehiveEditMode} // edit-form, sidebar, modal, inline
        data-nodehive-type="node"
        data-nodehive-parent_id=""
        data-nodehive-id={entity.data.drupal_internal__nid}
        data-nodehive-uuid={entity.data.id}
        data-node-type={entity.data.type}
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
