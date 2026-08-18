import React from 'react';

/**
 * A structured-data block, for the crawlers rather than the reader.
 *
 * `dangerouslySetInnerHTML` and not `{JSON.stringify(data)}`: React escapes text
 * children, so `&`, `<` and `>` in an address or a piece note would reach the
 * page as `&amp;` and the block would be invalid JSON to every parser reading it.
 * The one character that has to be escaped by hand is `<` — a `</script` inside a
 * string would close this element early — so it goes out as its `<` escape,
 * which JSON.parse reads back as the same character.
 *
 * Server-rendered on purpose. Google's crawler executes JavaScript, but on a
 * second pass with no guarantee of when; a script tag in the served HTML is read
 * on the first.
 */
export default function JsonLd({ data }: { data: object }): React.ReactElement {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}
