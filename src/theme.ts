import { MantineTheme } from '@mantine/core';
import { useColorScheme } from '@mantine/hooks';
import { ifElse, path, propEq } from 'ramda';

const bgColorSelectFn = (lightIndex: number, darkIndex: number) =>
  ifElse(
    propEq('colorScheme', 'light'),
    path(['colors', 'cbg', lightIndex]),
    path(['colors', 'cbg', darkIndex])
  );
const fgColorSelectFn = (lightIndex: number, darkIndex: number) =>
  ifElse(
    propEq('colorScheme', 'light'),
    path(['colors', 'cfg', lightIndex]),
    path(['colors', 'cfg', darkIndex])
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
        color: fgColorSelectFn(0, 8)(theme),
        backgroundColor: bgColorSelectFn(8, 0)(theme)
      },
      '#root': {
        height: '100%'
      },
      '::-webkit-scrollbar': {
        width: 4,
        backgroundColor: bgColorSelectFn(6, 2)(theme)
      },
      '::-webkit-scrollbar-track': {
        borderRadius: 2,
        backgroundColor: 'transparent'
      },
      '::-webkit-scrollbar-thumb': {
        borderRadius: 2,
        backgroundColor: bgColorSelectFn(4, 4)(theme)
      }
    })
  };
}
