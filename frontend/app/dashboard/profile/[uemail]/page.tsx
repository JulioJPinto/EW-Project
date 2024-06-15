'use client';

import {
  getUser,
  listFavoriteResources,
  listResourcesByUser,
  listUpvotedResources,
  listUserComments,
} from '@/lib/data';
import { CommentWithResourceDTO, ResourceDTO, UserDTO } from '@/lib/types';
import { useCallback, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Spinner from '@/components/spinner';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { nameInitials } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ResourceCard from '@/components/resource_card';
import PaginationNav from '@/components/pagination_nav';
import ProfileComment from '@/components/profile_comment';

export default function Profile({ params }: { params: { uemail: string } }) {
  const session = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [user, setUser] = useState<UserDTO | null>(null);
  const [tab, setTab] = useState<string | null>(null);
  const [resources, setResources] = useState<ResourceDTO[] | null>(null);
  const [favorites, setFavorites] = useState<ResourceDTO[] | null>(null);
  const [upvotes, setUpvotes] = useState<ResourceDTO[] | null>(null);
  const [comments, setComments] = useState<CommentWithResourceDTO[] | null>(
    null,
  );
  const [pageNr, setPageNr] = useState<number | null>(null);
  const [totalPages, setTotalPages] = useState<number | null>(null);

  const refreshResources = useCallback(() => {
    if (searchParams.has('tab')) {
      setTab(searchParams.get('tab') as string);
    } else {
      setTab('resources');
    }
    if (searchParams.has('p')) {
      setPageNr(parseInt(searchParams.get('p') as string));
    } else {
      setPageNr(1);
    }

    if (pageNr !== null && tab !== null) {
      switch (tab) {
        case 'resources':
          listResourcesByUser(decodeURIComponent(params.uemail), pageNr)
            .then((res) => {
              setResources(res.data);
              setTotalPages(res.pagesNr);
            })
            .catch(() => {});
          break;
        case 'favorites':
          listFavoriteResources(decodeURIComponent(params.uemail), pageNr)
            .then((res) => {
              setFavorites(res.data);
              setTotalPages(res.pagesNr);
            })
            .catch(() => {});
          break;
        case 'upvotes':
          listUpvotedResources(decodeURIComponent(params.uemail), pageNr)
            .then((res) => {
              setUpvotes(res.data);
              setTotalPages(res.pagesNr);
            })
            .catch(() => {});
          break;
        case 'comments':
          listUserComments(decodeURIComponent(params.uemail), pageNr)
            .then((res) => {
              setComments(res.data);
              setTotalPages(res.pagesNr);
            })
            .catch(() => {});
          break;
      }
    }
  }, [params.uemail, pageNr, searchParams, tab]);

  useEffect(() => {
    refreshResources();
  }, [refreshResources]);

  useEffect(() => {
    getUser(decodeURIComponent(params.uemail))
      .then((user) => setUser(user))
      .catch(() => router.push('/404'));
  }, [params.uemail, router]);

  return user !== null ? (
    <div className='sm:px-28 md:px-48 lg:px-40 2xl:px-96'>
      <div className='bg-accent w-full h-40'></div>
      <div className='-translate-y-14 space-y-4 px-4'>
        <div className='flex justify-between items-center'>
          <Avatar className='w-28 h-28 ring-4 ring-background'>
            <AvatarImage src={user.image} />
            <AvatarFallback className='text-5xl'>
              {nameInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          {session.status === 'authenticated' &&
            session.data.user.email === decodeURIComponent(params.uemail) && (
              <Button className='translate-y-9 flex space-x-1 items-center'>
                <i className='ph ph-pencil-simple'></i>
                <span>Edit profile</span>
              </Button>
            )}
        </div>
        <div>
          <h1 className='text-xl font-bold'>{user.name}</h1>
          <p className='text-muted-foreground'>{user.email}</p>
        </div>
        <Tabs
          defaultValue={tab ?? 'resources'}
          onValueChange={() => setPageNr(null)}
          className='w-full space-y-4'
        >
          <TabsList className='grid w-full grid-cols-4'>
            <TabsTrigger
              value='resources'
              onClick={() => router.push(`${pathname}?tab=resources`)}
            >
              Resources
            </TabsTrigger>
            <TabsTrigger
              value='favorites'
              onClick={() => router.push(`${pathname}?tab=favorites`)}
            >
              Favorites
            </TabsTrigger>
            <TabsTrigger
              value='comments'
              onClick={() => router.push(`${pathname}?tab=comments`)}
            >
              Comments
            </TabsTrigger>
            <TabsTrigger
              value='upvotes'
              onClick={() => router.push(`${pathname}?tab=upvotes`)}
            >
              Upvotes
            </TabsTrigger>
          </TabsList>
          <TabsContent value='resources'>
            {resources !== null ? (
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {resources.length > 0 ? (
                  resources.map((resource) => (
                    <ResourceCard
                      key={resource._id}
                      resource={resource}
                      refreshResources={refreshResources}
                    />
                  ))
                ) : (
                  <p className='text-muted-foreground'>Nothing here for now.</p>
                )}
              </div>
            ) : (
              <div className='flex items-center justify-center'>
                <Spinner />
              </div>
            )}
          </TabsContent>
          <TabsContent value='favorites'>
            {favorites !== null ? (
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {favorites.length > 0 ? (
                  favorites.map((resource) => (
                    <ResourceCard
                      key={resource._id}
                      resource={resource}
                      refreshResources={refreshResources}
                    />
                  ))
                ) : (
                  <p className='text-muted-foreground'>Nothing here for now.</p>
                )}
              </div>
            ) : (
              <div className='flex items-center justify-center'>
                <Spinner />
              </div>
            )}
          </TabsContent>
          <TabsContent value='comments'>
            {comments !== null ? (
              <div className='grid grid-cols-1 gap-4'>
                {comments.length > 0 ? (
                  comments.map((comment) => (
                    <ProfileComment
                      key={comment._id}
                      comment={comment}
                      refreshResources={refreshResources}
                    />
                  ))
                ) : (
                  <p className='text-muted-foreground'>Nothing here for now.</p>
                )}
              </div>
            ) : (
              <div className='flex items-center justify-center'>
                <Spinner />
              </div>
            )}
          </TabsContent>
          <TabsContent value='upvotes'>
            {upvotes !== null ? (
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {upvotes.length > 0 ? (
                  upvotes.map((resource) => (
                    <ResourceCard
                      key={resource._id}
                      resource={resource}
                      refreshResources={refreshResources}
                    />
                  ))
                ) : (
                  <p className='text-muted-foreground'>Nothing here for now.</p>
                )}
              </div>
            ) : (
              <div className='flex items-center justify-center'>
                <Spinner />
              </div>
            )}
          </TabsContent>
          {pageNr !== null &&
            totalPages !== null &&
            (resources?.length ?? 0) > 0 && (
              <PaginationNav pageNr={pageNr} totalPages={totalPages} />
            )}
        </Tabs>
      </div>
    </div>
  ) : (
    <div className='flex items-center justify-center h-[calc(100vh-10rem)]'>
      <Spinner />
    </div>
  );
}
