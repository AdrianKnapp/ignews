import { render, screen } from '@testing-library/react';
import { mocked } from 'ts-jest/utils';
import Post, { getStaticProps } from '../pages/posts/preview/[slug]';
import { useSession } from 'next-auth/client';
import { getPrismicClient } from '../services/prismic';
import { useRouter } from 'next/router';

const post = {
  slug: 'my-new-post',
  title: 'My new post',
  content: '<p>This is my new post</p>',
  updatedAt: '04-01-2021'
}

jest.mock('next-auth/client')
jest.mock('next/router')
jest.mock('../services/prismic')

describe('Post preview page', () => {
  it('renders correcly', () => {
    const useSessionMocked = mocked(useSession);

    useSessionMocked.mockReturnValueOnce([null, false]);

    render(<Post post={post} />)

    expect(screen.getByText("This is my new post")).toBeInTheDocument();
    expect(screen.getByText("Wanna continue reading?")).toBeInTheDocument()
  });

  it('redirects user to full post when subscribed', async () => {
    const getSessionMocked = mocked(useSession);
    const useRouterMocked = mocked(useRouter);
    const pushMock = jest.fn();


    getSessionMocked.mockReturnValueOnce([
      {
        activeSubscription: 'fake-active-subscription'
      },
      false
    ] as never);
    
    useRouterMocked.mockReturnValueOnce({
      push: pushMock,
    } as any);

    render(<Post post={post} />)

    expect(pushMock).toHaveBeenCalledWith('/posts/my-new-post');
  });

  it('loads initial data', async () => {
    const getPrismicClientMocked = mocked(getPrismicClient);

    getPrismicClientMocked.mockReturnValueOnce({
      getByUID: jest.fn().mockResolvedValueOnce({
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
      })
    } as any);

    const response = await getStaticProps({
      params: {
        slug: 'my-new-post'
      }
    });

    expect(response).toEqual(
      expect.objectContaining({
        props: {
          post: {
            slug: 'my-new-post',
            title: 'My new post',
            content: '<p>This is my new post</p>',
            updatedAt: '01 de abril de 2021'
          }
        }
      })
    );
  })
})