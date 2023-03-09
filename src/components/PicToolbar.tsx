//@ts-nocheck
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
  IconPercentage,
  IconZoomIn,
  IconZoomOut
} from '@tabler/icons-react';
import { FC, useRef } from 'react';
import { useZoomState } from '../states/zoom';

export const PicToolbar: FC = () => {
  const { autoFit, currentZoom, viewMode, zoom, switchViewMode } = useZoomState();
  const zoomHandlers = useRef<NumberInputHandlers>();

  return (
    <Group w="100%" position="right" spacing={8} px={4} py={4}>
      <Tooltip label="适应窗口宽度">
        <ActionIcon variant={autoFit ? 'filled' : 'subtle'} color="grape">
          <IconArrowAutofitWidth stroke={1.5} size={24} />
        </ActionIcon>
      </Tooltip>
      <Tooltip label="缩小占据比例">
        <ActionIcon
          variant="subtle"
          color="grape"
          onClick={() => zoomHandlers.current?.decrement()}
        >
          <IconZoomOut stroke={1.5} size={24} />
        </ActionIcon>
      </Tooltip>
      <Tooltip label="图片宽度占视图宽度比例">
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
      </Tooltip>
      <Tooltip label="放大占据比例">
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
            { label: '连续', value: 'continuation' }
          ]}
        />
      </Tooltip>
    </Group>
  );
};
