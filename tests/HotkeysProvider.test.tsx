import { render } from '@testing-library/react'
import { HotkeysProvider, useHotkeysContext, useHotkeys } from '../src'
import { act, renderHook } from '@testing-library/react-hooks'
import { ReactNode } from 'react'
import { HotkeysContextType } from '../src/HotkeysProvider'

test('should render children', () => {
  const { getByText } = render(
    <HotkeysProvider>
      <div>Hello</div>
    </HotkeysProvider>,
  )

  expect(getByText('Hello')).toBeInTheDocument()
})

test('should default to wildcard scope', () => {
  const { result } = renderHook(() => useHotkeysContext(), {
    wrapper: HotkeysProvider,
  })

  expect(result.current.activeScopes).toEqual(['*'])
})

test('should default to wildcard scope if empty array is provided as initialActiveScopes', () => {
  const wrapper = ({ children }: { children: ReactNode }) => <HotkeysProvider
    initiallyActiveScopes={[]}>{children}</HotkeysProvider>
  const { result } = renderHook(() => useHotkeysContext(), {
    wrapper,
  })

  expect(result.current.activeScopes).toEqual(['*'])
})

test('should return active scopes and scope modifying functions', () => {
  const { result } = renderHook(() => useHotkeysContext(), {
    wrapper: HotkeysProvider,
  })

  expect(result.current.activeScopes).toEqual(['*'])
  expect(result.current.activateScope).toBeInstanceOf(Function)
  expect(result.current.deactivateScope).toBeInstanceOf(Function)
  expect(result.current.toggleScope).toBeInstanceOf(Function)
})

test('should activate scope by calling activateScope', () => {
  const { result } = renderHook(() => useHotkeysContext(), {
    wrapper: HotkeysProvider,
  })

  act(() => {
    result.current.activateScope('foo')
  })

  expect(result.current.activeScopes).toEqual(['foo'])
})

test('should reactivate wildcard scope if all other scopes are deactivated', () => {
  const { result } = renderHook(() => useHotkeysContext(), {
    wrapper: HotkeysProvider,
  })

  act(() => {
    result.current.activateScope('foo')
  })

  expect(result.current.activeScopes).toEqual(['foo'])

  act(() => {
    result.current.deactivateScope('foo')
  })

  expect(result.current.activeScopes).toEqual(['*'])
})

test('should return multiple scopes if different scopes are activated', () => {
  const { result } = renderHook(() => useHotkeysContext(), {
    wrapper: HotkeysProvider,
  })

  act(() => {
    result.current.activateScope('foo')
  })

  expect(result.current.activeScopes).toEqual(['foo'])

  act(() => {
    result.current.activateScope('bar')
  })

  expect(result.current.activeScopes).toEqual(['foo', 'bar'])
})

test('should deactivate scope by calling deactivateScope', () => {
  const { result } = renderHook(() => useHotkeysContext(), {
    wrapper: HotkeysProvider,
  })

  act(() => {
    result.current.activateScope('foo')
  })

  act(() => {
    result.current.activateScope('bar')
  })

  expect(result.current.activeScopes).toEqual(['foo', 'bar'])

  act(() => {
    result.current.deactivateScope('foo')
  })

  expect(result.current.activeScopes).toEqual(['bar'])
})

test('should toggle scope by calling toggleScope', () => {
  const { result } = renderHook(() => useHotkeysContext(), {
    wrapper: HotkeysProvider,
  })

  act(() => {
    result.current.activateScope('foo')
  })

  expect(result.current.activeScopes).toEqual(['foo'])

  act(() => {
    result.current.toggleScope('foo')
  })

  expect(result.current.activeScopes).toEqual(['*'])

  act(() => {
    result.current.toggleScope('foo')
  })

  expect(result.current.activeScopes).toEqual(['foo'])
})

test('should keep wildcard scope active when all is the only active scope and gets deactivated', () => {
  const { result } = renderHook(() => useHotkeysContext(), {
    wrapper: HotkeysProvider,
  })

  act(() => {
    result.current.deactivateScope('*')
  })

  expect(result.current.activeScopes).toEqual(['*'])
})

test('should return initially set scopes', () => {
  const wrapper = ({ children }: { children: ReactNode }) => <HotkeysProvider
    initiallyActiveScopes={['foo', 'bar']}>{children}</HotkeysProvider>
  const { result } = renderHook(() => useHotkeysContext(), {
    wrapper,
  })

  expect(result.current.activeScopes).toEqual(['foo', 'bar'])
})

test('should return all bound hotkeys', () => {
  const useIntegratedHotkeys = () => {
    useHotkeys('a', () => null, { scopes: ['foo'] })

    return useHotkeysContext()
  }

  const wrapper = ({ children }: { children: ReactNode }) => <HotkeysProvider
    initiallyActiveScopes={['foo']}>{children}</HotkeysProvider>
  const { result } = renderHook(useIntegratedHotkeys, {
    wrapper,
  })

  expect(result.current.hotkeys).toHaveLength(1)
})

test('should update bound hotkeys when useHotkeys changes its scopes', () => {
  const useIntegratedHotkeys = (scopes: string[]) => {
    useHotkeys('a', () => null, { scopes })

    return useHotkeysContext()
  }

  const wrapper = ({ children }: { children: ReactNode }) => <HotkeysProvider
    initiallyActiveScopes={['foo']}>{children}</HotkeysProvider>
  const { result, rerender } = renderHook<{ scopes: string[] }, HotkeysContextType>(({ scopes }) => useIntegratedHotkeys(scopes), {
    // @ts-ignore
    wrapper,
    initialProps: {
      scopes: ['foo'],
    },
  })

  expect(result.current.hotkeys).toHaveLength(1)

  rerender({ scopes: ['bar'] })

  expect(result.current.hotkeys).toHaveLength(0)
})
