import React, { useEffect } from 'react';
import { notifications } from '@mantine/notifications';
import { Button, Group, Stack, Text } from '@mantine/core';
import API from '../api';

function compareVersions(a, b) {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const na = pa[i] || 0;
    const nb = pb[i] || 0;
    if (na > nb) return 1;
    if (na < nb) return -1;
  }
  return 0;
}

let checked = false;

export default function UpdateNotification() {
  useEffect(() => {
    if (checked) return;
    checked = true;

    const checkUpdate = async () => {
      try {
        const current = await API.getVersion();
        const release = await API.getLatestRelease();
        if (!current?.version || !release?.tag_name) return;
        const latest = release.tag_name.startsWith('v')
          ? release.tag_name.slice(1)
          : release.tag_name;
        const ignored = localStorage.getItem('ignoredVersion');
        if (compareVersions(latest, current.version) > 0 && ignored !== latest) {
          notifications.show({
            id: 'update-available',
            title: 'Update Available',
            message: (
              <Stack>
                <Text size="sm">
                  Dispatcharr {latest} is available. You are using {current.version}.
                </Text>
                <Group grow>
                  <Button
                    size="xs"
                    component="a"
                    href={release.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Update
                  </Button>
                  <Button
                    size="xs"
                    variant="default"
                    onClick={() => {
                      localStorage.setItem('ignoredVersion', latest);
                      notifications.hide('update-available');
                    }}
                  >
                    Ignore
                  </Button>
                </Group>
              </Stack>
            ),
            autoClose: false,
            color: 'blue',
          });
        }
      } catch (e) {
        // ignore errors
      }
    };

    checkUpdate();
  }, []);

  return null;
}
