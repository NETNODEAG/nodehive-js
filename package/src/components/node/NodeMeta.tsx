'use client';

import { AuthWrapper } from "../auth/AuthWrapper";

export function NodeMeta({ node }) {
  return (
    <>
      {!node.status && (
        <div
          className="mb-5 border-l-4 border-yellow-500 bg-yellow-100 p-4 text-yellow-700"
          role="alert"
        >
          <p className="font-bold">Info</p>
          <p>
            [{node.node_type.meta.drupal_internal__target_id}] {node.title} is
            unpublished.
          </p>
        </div>
      )}

      <AuthWrapper>
        {node.status && (
          <div
            className="mb-5 border-l-4 border-green-500 bg-green-100 p-4 text-yellow-700"
            role="alert"
          >
            <p className="font-bold">Info</p>
            <p>
              [{node.node_type.meta.drupal_internal__target_id}] {node.title} is
              published.
            </p>
          </div>
        )}
      </AuthWrapper>
    </>
  );
}
