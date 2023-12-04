'use client';

import { useEffect, useState } from 'react';
import { NodeHiveClient } from '../NodeHiveClient';

export function SmartActionButtons() {
  
  const [isInIframe, setIsInIframe] = useState(false);
  const [userProfilePic, setUserProfilePic] = useState('');

  const client = new NodeHiveClient(
    process.env.NEXT_PUBLIC_DRUPAL_REST_BASE_URL,
    ''
  );

  useEffect(() => {
    const inIframe = window.self !== window.top;
    setIsInIframe(inIframe);

    if (inIframe) {
      enableVisualEditing();
    }

    const handleMessage = (event) => {
      if (event.data === 'reloadFrame') {
        refresh();
      }
    };

    window.addEventListener('message', handleMessage);

    // Extract profile picture from cookie
    const userDetails = client.getUserDetails();
    if (userDetails) {
      if (userDetails.user_picture && userDetails.user_picture.length > 0) {
        setUserProfilePic(userDetails.user_picture[0].url); // Set the profile picture URL
      }
    }

    // Clean up event listener
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  const refresh = () => {
    async function clearCache() {
      const currentpath = window.location.pathname;
      const res = await fetch('/api/nodehive/revalidate?path=' + currentpath);
      if (res.ok) {
        location.reload();
      }
    }
    clearCache();
  };

  const openbackend = () => {
    const currentlocation = window.location;

    location.href =
      process.env.NEXT_PUBLIC_DRUPAL_BASE_URL +
      '/space/' +
      process.env.NEXT_PUBLIC_NODEHIVE_SPACE_ID +
      '/visualeditor?url=' +
      currentlocation;
  };

  const editindrupal = (nodeId) => {
    const currentlocation = window.location.href; // Use href to get the full URL
    const editUrl =
      process.env.NEXT_PUBLIC_DRUPAL_BASE_URL +
      '/node/' +
      nodeId +
      '/edit?destination=' +
      encodeURIComponent(currentlocation);

    parent.location.href = editUrl;
  };

  const spacedashboard = () => {
    if (isInIframe) {
      parent.location.href =
        process.env.NEXT_PUBLIC_DRUPAL_BASE_URL +
        '/space/' +
        process.env.NEXT_PUBLIC_NODEHIVE_SPACE_ID;
    } else {
      location.href =
        process.env.NEXT_PUBLIC_DRUPAL_BASE_URL +
        '/space/' +
        process.env.NEXT_PUBLIC_NODEHIVE_SPACE_ID;
    }
  };

  const showinfrontend = () => {
    const currentlocation = window.location;
    if (isInIframe) {
      parent.location.href = currentlocation;
    } else {
      location.href = currentlocation;
    }
  };

  async function handleLogout() {
    client.logout();
    window.location.href = '/';
  }

  const enableVisualEditing = () => {
    // select nodes and overlay with edit buttons
    const nodes = document.querySelectorAll(
      '[data-nodehive-enable="true"][data-nodehive-type="node"]'
    );
    nodes.forEach((el) => {
      // Create overlay div
      const overlay = document.createElement('div');
      overlay.innerHTML = '<div class="text-center">Edit</div';
      overlay.className =
        'absolute left-5 cursor-pointer rounded rounded-full bg-green-500 px-4 py-2 font-bold text-white hover:bg-green-700';
      overlay.setAttribute(
        'data-nodehive-uuid',
        el.getAttribute('data-nodehive-uuid')
      );



      // Set up click handler for the overlay
      const type = el.getAttribute('data-nodehive-type');
      const uuid = el.getAttribute('data-nodehive-uuid');
      const id = el.getAttribute('data-nodehive-id');
      const parent_id = el.getAttribute('data-nodehive-parent_id');
      const editmode = el.getAttribute('data-nodehive-editmode');

      // #todo, add different behaviour based on editmode
      //overlay.onclick = () => openComposableComponent({ type, uuid, id, parent_id });
      overlay.onclick = () => editindrupal(id);

      // Append the overlay div to the node
      el.prepend(overlay);
    });

    // select paragraphs and overlay with edit buttons
    const paragraphs = document.querySelectorAll(
      '[data-nodehive-enable="true"][data-nodehive-type="paragraph"]'
    );
    paragraphs.forEach((el) => {
      // Create overlay div
      const overlay = document.createElement('div');
      overlay.innerHTML = '<div class="text-center">Edit paragraph</div';
      overlay.className =
        'absolute right-5 rounded rounded-full bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700';
      overlay.setAttribute(
        'data-nodehive-uuid',
        el.getAttribute('data-nodehive-uuid')
      );

      // Set up click handler for the overlay
      const type = el.getAttribute('data-nodehive-type');
      const uuid = el.getAttribute('data-nodehive-uuid');
      const id = el.getAttribute('data-nodehive-id');
      const parent_id = el.getAttribute('data-nodehive-parent_id');
      overlay.onclick = () =>
        openComposableComponent({ type, uuid, id, parent_id });

      // Append the overlay div
      el.prepend(overlay);
    });
  };

  const openComposableComponent = ({ type, uuid, id, parent_id }) => {
    console.log('openComposableComponent', type, uuid, id, parent_id);
    window.parent.postMessage(
      {
        type: type,
        uuid,
        id,
        parent_id,
        pathname: window.location.pathname,
      },
      '*'
    );
  };

  return (
    <>
      <div className="fixed bottom-8 left-1/2">
        {/*<div className="w-24 -translate-x-1/2 rounded-tl-lg  rounded-tr-lg bg-zinc-700 px-4 py-1 text-center text-[8px] font-bold text-white">
        NodeHive
  </div>*/}
        <div className="-translate-x-1/2 rounded-full bg-zinc-700 p-3">
          <div className="flex gap-2">
            {/* User Profile Picture */}
            {userProfilePic && (
              <img
                src={userProfilePic}
                alt="Profile"
                className="cover h-10 w-10 rounded-full border-2 border-white"
              />
            )}

            {!isInIframe && (
              <button
                onClick={openbackend}
                className="flex gap-2 rounded rounded-full bg-zinc-800 p-2 font-bold text-white hover:bg-zinc-600"
                title="Edit in Drupal"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1}
                  stroke="currentColor"
                  className="h-6 w-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                  />
                </svg>
              </button>
            )}

            {/*isInIframe && (
                    <button
                        onClick={enableVisualEditing}
                        className="flex gap-2 rounded rounded-lg bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="h-6 w-6"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                            />
                        </svg>
                    </button>
                )*/}

            <button
              onClick={refresh}
              className="flex gap-2 rounded rounded-full bg-zinc-800 p-2 font-bold text-white hover:bg-zinc-600"
              title="Refresh"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1"
                stroke="currentColor"
                className="h-6 w-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                />
              </svg>
            </button>

            {isInIframe && (
              <button
                onClick={showinfrontend}
                className="flex gap-2 rounded rounded-full bg-zinc-800 p-2 font-bold text-white hover:bg-zinc-600"
                title="Show in frontend"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1}
                  stroke="currentColor"
                  className="h-6 w-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </button>
            )}
            {!isInIframe && (
              <button
                onClick={handleLogout}
                className="flex gap-2 rounded rounded-full bg-zinc-800 p-2 font-bold text-white hover:bg-zinc-600"
                title="Logout"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1}
                  stroke="currentColor"
                  className="h-6 w-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
        <div className="w-24 -translate-x-1/2 rounded-bl-lg  rounded-br-lg bg-zinc-700 px-4 py-1 text-center text-[8px] font-bold text-white">
          Smart Actions!
        </div>
      </div>
    </>
  );
}
