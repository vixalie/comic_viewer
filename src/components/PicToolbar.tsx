import {
  ActionIcon,
  Group,
  NumberInput,
  NumberInputHandlers,
  rem,
  SegmentedControl,
  Tooltip
} from '@mantine/core';
import {
  IconArrowAutofitWidth,
  IconLock,
  IconPercentage,
  IconZoomIn,
  IconZoomOut
} from '@tabler/icons-react';
import { FC, useRef } from 'react';
import { useZoomState } from '../states/zoom';

export const PicToolbar: FC = () => {
  const { lock, autoFit, currentZoom, viewMode, zoom, switchViewMode } = useZoomState();
  const zoomHandlers = useRef<NumberInputHandlers>();

  return (
    <Group w="100%" position="right" spacing={8} px={4} py={4}>
      <Tooltip label="锁定缩放">
        <ActionIcon variant={lock ? 'filled' : 'subtle'} color="grape">
          <IconLock stroke={1.5} size={24} />
        </ActionIcon>
      </Tooltip>
      <Tooltip label="适应窗口宽度">
        <ActionIcon variant={autoFit ? 'filled' : 'subtle'} color="grape">
          <IconArrowAutofitWidth stroke={1.5} size={24} />
        </ActionIcon>
      </Tooltip>
      <Tooltip label="缩小">
        <ActionIcon
          variant="subtle"
          color="grape"
          onClick={() => zoomHandlers.current?.decrement()}
        >
          <IconZoomOut stroke={1.5} size={24} />
        </ActionIcon>
      </Tooltip>
      <NumberInput
        hideControls
        size="xs"
        min={20}
        max={100}
        step={5}
        value={currentZoom}
        onChange={value => zoom(value)}
        handlersRef={zoomHandlers}
        styles={{ input: { width: rem(58), textAlign: 'center' } }}
        rightSection={<IconPercentage stroke={1.5} size={16} />}
      />
      <Tooltip label="放大">
        <ActionIcon
          variant="subtle"
          color="grape"
          onClick={() => zoomHandlers.current?.increment()}
        >
          <IconZoomIn stroke={1.5} size={24} />
        </ActionIcon>
      </Tooltip>
      <Tooltip label="翻页模式">
        <SegmentedControl
          size="xs"
          value={viewMode}
          onChange={value => switchViewMode(value)}
          color="grape"
          data={[
            { label: '单页', value: 'single' },
            { label: '双页', value: 'double' },
            { label: '连续', value: 'continuation' }
          ]}
        />
      </Tooltip>
    </Group>
  );
};
