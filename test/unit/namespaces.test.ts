import MediaWiki from '../../src/MediaWiki.js'

describe('MediaWiki.setNamespaces with namespace numbers and names', () => {
  beforeEach(() => {
    MediaWiki.reset()
  })

  const mockSiteInfo: any = {
    namespaces: {
      '-1': { id: -1, name: 'Special', canonical: 'Special' },
      '0': { id: 0, name: '', content: true },
      '1': { id: 1, name: 'Talk', subpages: true, canonical: 'Talk' },
      '3': { id: 3, name: 'User talk', subpages: true, canonical: 'User talk' },
      '100': { id: 100, name: 'Portal', canonical: 'Portal' },
      '106': { id: 106, name: 'Thésaurus', canonical: 'Thesaurus' },
      '110': { id: 110, name: 'Story', canonical: 'Story', content: true },
    },
    namespacealiases: [
      { id: 100, alias: 'P' },
      { id: 106, alias: 'Wiktionnaire:Thésaurus' },
    ],
  }

  test('only main namespace is mirrored by default', () => {
    MediaWiki.setNamespaces(mockSiteInfo, [], [])
    expect(MediaWiki.namespacesToMirror).toEqual([0])
  })

  test('stores namespace numbers, never names', () => {
    MediaWiki.setNamespaces(mockSiteInfo, ['Portal', 'P', 100], [])
    expect(MediaWiki.namespacesToMirror.every((ns) => typeof ns === 'number')).toBe(true)
    expect(MediaWiki.namespacesToMirror).toEqual([0, 100])
  })

  test('addNamespaces accepts numbers', () => {
    MediaWiki.setNamespaces(mockSiteInfo, [100], [])
    expect(MediaWiki.namespacesToMirror).toEqual([0, 100])
  })

  test('addNamespaces accepts numbers given as strings', () => {
    MediaWiki.setNamespaces(mockSiteInfo, ['100', ' 106 '], [])
    expect(MediaWiki.namespacesToMirror).toEqual([0, 100, 106])
  })

  test('addNamespaces accepts local name, case insensitive', () => {
    MediaWiki.setNamespaces(mockSiteInfo, ['thésaurus'], [])
    expect(MediaWiki.namespacesToMirror).toEqual([0, 106])
  })

  test('addNamespaces accepts canonical name', () => {
    MediaWiki.setNamespaces(mockSiteInfo, ['Thesaurus'], [])
    expect(MediaWiki.namespacesToMirror).toEqual([0, 106])
  })

  test('addNamespaces accepts alias', () => {
    MediaWiki.setNamespaces(mockSiteInfo, ['p'], [])
    expect(MediaWiki.namespacesToMirror).toEqual([0, 100])
  })

  test('underscores and spaces are equivalent in names', () => {
    MediaWiki.setNamespaces(mockSiteInfo, ['User_talk'], [])
    expect(MediaWiki.namespacesToMirror).toEqual([0, 3])
  })

  test('numbers and names can be mixed and do not create duplicates', () => {
    MediaWiki.setNamespaces(mockSiteInfo, [100, 'portal', 'P', 'Thesaurus'], [])
    expect(MediaWiki.namespacesToMirror).toEqual([0, 100, 106])
  })

  test('onlyNamespaces accepts names', () => {
    MediaWiki.setNamespaces(mockSiteInfo, [], ['portal'])
    expect(MediaWiki.namespacesToMirror).toEqual([100])
  })

  test('onlyNamespaces accepts numbers', () => {
    MediaWiki.setNamespaces(mockSiteInfo, [], [100, 1])
    expect(MediaWiki.namespacesToMirror).toEqual([1, 100])
  })

  test('onlyNamespaces accepts an alias', () => {
    MediaWiki.setNamespaces(mockSiteInfo, [], ['P'])
    expect(MediaWiki.namespacesToMirror).toEqual([100])
  })

  test('blacklisted namespace is not mirrored even if it is a content namespace', () => {
    MediaWiki.setNamespaces(mockSiteInfo, [], [])
    expect(MediaWiki.namespacesToMirror).not.toContain(110)
  })

  test('unknown namespace name is rejected', () => {
    expect(() => MediaWiki.setNamespaces(mockSiteInfo, ['Nope'], [])).toThrow(/"Nope" given in --addNamespaces/)
    expect(() => MediaWiki.setNamespaces(mockSiteInfo, [], ['Nope'])).toThrow(/"Nope" given in --onlyNamespaces/)
  })
})
