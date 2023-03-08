import { MantineTheme } from '@mantine/core';
import { useColorScheme } from '@mantine/hooks';
import { ifElse, path, propEq } from 'ramda';

const bgColorSelectFn = ifElse(
  propEq('colorScheme', 'light'),
  path(['colors', 'cbg', 8]),
  path(['colors', 'cbg', 0])
);
const fgColorSelectFn = ifElse(
  propEq('colorScheme', 'light'),
  path(['colors', 'cfg', 0]),
  path(['colors', 'cfg', 8])
);

export function useAppTheme(): Partial<MantineTheme> {
  const colorScheme = useColorScheme();

  return {
    colorScheme,
    focusRing: 'never',
    defaultRadius: 'xs',
    colors: {
      cfg: [
        '#0f0f0f',
        '#151515',
        '#262626',
        '#414141',
        '#626262',
        '#878787',
        '#acacac',
        '#cecece',
        '#e8e8e8',
        '#f9f9f9'
      ],
      cbg: [
        '#1a202c',
        '#1e2533',
        '#2a3446',
        '#3c4a65',
        '#53678b',
        '#7689ad',
        '#a0adc6',
        '#c6cedd',
        '#e5e8ef',
        '#f8f9fb'
      ]
    },
    primaryColor: 'violet',
    globalStyles: theme => ({
      'html, body': {
        height: '100vh',
        color: fgColorSelectFn(theme),
        backgroundColor: bgColorSelectFn(theme)
      },
      '#root': {
        height: '100%'
      }
    })
  };
}
