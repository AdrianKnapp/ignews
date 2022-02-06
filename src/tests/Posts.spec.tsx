import { render, screen } from '@testing-library/react';
import { mocked } from 'ts-jest/utils';
import Posts, { getStaticProps } from '../pages/posts';
import { getPrismicClient } from '../services/prismic'

const posts = [
  {
    slug: 'my-new-post',
    title: 'My new post',
    excerpt: 'This is my new post',
    updatedAt: '04-01-2021'
  }
]

jest.mock('../services/prismic')

describe('Posts page', () => {
  it('renders correcly', () => {
    render(<Posts posts={posts} />)

    expect(screen.getByText("My new post")).toBeInTheDocument()
  });

  it('loads initial data', async () => {
    const getPrismicClientMocked = mocked(getPrismicClient);

    getPrismicClientMocked.mockReturnValueOnce({
      query: jest.fn().mockResolvedValueOnce({
        results: [
          {
            uid: 'my-new-post',
            data: {
              title: [{
                type: 'heading1',
                text: 'My new post'
              }],
              content: [{
                type: 'paragraph',
                text: 'This is my new post'
              }],
            },
            last_publication_date: '04-01-2021'
          }
        ]
      })
    } as never);

    const response = await getStaticProps({});

    expect(response).toEqual(
      expect.objectContaining({
        props: {
          posts: [
            {
              slug: 'my-new-post',
              title: 'My new post',
              excerpt: 'This is my new post',
              updatedAt: '01 de abril de 2021'
            }
          ]
        }
      })
    );
  });
})