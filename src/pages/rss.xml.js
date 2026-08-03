import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const posts = await getCollection('posts', ({ data }) => !data.draft);
  const sorted = posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

  return rss({
    title: 'Abhishek Mohanty — Oracle HCM Cloud Notes',
    description:
      'Field notes from a decade in the Oracle HCM Cloud trenches — Fast Formulas, Absence Management, Time and Labor, Redwood, HDL, OTBI.',
    site: context.site,
    items: sorted.map((post) => ({
      title: post.data.title,
      description: post.data.description ?? '',
      pubDate: post.data.pubDate,
      link: `/posts/${post.slug}/`,
      categories: post.data.tags,
    })),
    customData: `<language>en-us</language>`,
  });
}
