import { HttpStatusCode } from 'axios';
import {
  ResourceDTO,
  SubjectDB,
  UserDB,
  CourseDB,
  DocumentTypeDB,
  UserSignUp,
  ResourceDB,
  CommentDTO,
  CommentWithResourceDTO,
  UserDTO,
} from './types';
import { config } from '@/lib/config';

export const listResources = async (
  type: 'popular' | 'newest' | 'all',
  page: number,
) => {
  try {
    const response = await fetch(`/api/resources/${type}/${page}`);
    const data = (await response.json()) as ResourceDTO[];
    const countResponse = await fetch('/api/resources/count');
    const count = (await countResponse.json()) as number;
    const pagesNr = Math.ceil(count / config.pages.PAGE_SIZE);
    return {
      data: data,
      pagesNr: pagesNr,
    };
  } catch (error) {
    throw new Error((error as Error).message);
  }
};

export const listFavoriteResources = async (
  userEmail: string,
  page: number,
) => {
  try {
    const userFavorites = await getUserFavorites(userEmail);
    if (userFavorites.length === 0) return { data: [], pagesNr: 0 };

    const response = await fetch(
      `/api/resources/ids/${page}?` +
        new URLSearchParams({ ids: userFavorites.toString() }).toString(),
    );
    const favoriteResources = (await response.json()) as ResourceDTO[];

    const countResponse = await fetch(
      `/api/resources/ids/count?` +
        new URLSearchParams({ ids: userFavorites.toString() }).toString(),
    );
    const count = (await countResponse.json()) as number;
    const pagesNr = Math.ceil(count / config.pages.PAGE_SIZE);
    return {
      data: favoriteResources,
      pagesNr: pagesNr,
    };
  } catch (error) {
    throw new Error((error as Error).message);
  }
};

export const listResourcesByUser = async (userEmail: string, page: number) => {
  try {
    const response = await fetch(`/api/resources/from/${userEmail}/${page}`);
    const data = (await response.json()) as ResourceDTO[];
    const countResponse = await fetch(`/api/resources/from/${userEmail}/count`);
    const count = (await countResponse.json()) as number;
    const pagesNr = Math.ceil(count / config.pages.PAGE_SIZE);
    return {
      data: data,
      pagesNr: pagesNr,
    };
  } catch (error) {
    throw new Error((error as Error).message);
  }
};

export const searchResources = async (query: string, page: number) => {
  try {
    const response = await fetch(`/api/resources/search/${page}?q=${query}`);
    const data = (await response.json()) as ResourceDTO[];
    const countResponse = await fetch(`/api/resources/search/count?q=${query}`);
    const count = (await countResponse.json()) as number;
    const pagesNr = Math.ceil(count / config.pages.PAGE_SIZE);
    return {
      data: data,
      pagesNr: pagesNr,
    };
  } catch (error) {
    throw new Error((error as Error).message);
  }
};

export const makeVisible = async (resourceId: string) => {
  const response = await fetch(`/api/resources/${resourceId}/show`, {
    method: 'GET',
  });

  if (response.status === (HttpStatusCode.Unauthorized as number)) {
    throw new Error("You've been blocked from performing this action.");
  }
};
export const makeInvisible = async (resourceId: string) => {
  const response = await fetch(`/api/resources/${resourceId}/hide`, {
    method: 'GET',
  });

  if (response.status === (HttpStatusCode.Unauthorized as number)) {
    throw new Error("You've been blocked from performing this action.");
  }
};

export const lock = async (resourceId: string) => {
  await fetch(`/api/resources/${resourceId}/lock`, {
    method: 'GET',
  });
};

export const unlock = async (resourceId: string) => {
  await fetch(`/api/resources/${resourceId}/unlock`, {
    method: 'GET',
  });
};

export const getUser = async (userEmail: string) => {
  try {
    const response = await fetch('/api/users/' + userEmail);
    const data = (await response.json()) as UserDTO;
    return data;
  } catch (error) {
    throw new Error((error as Error).message);
  }
};

const getUserFavorites = async (userEmail: string) => {
  try {
    const response = await fetch('/api/users/' + userEmail + '/favorites');
    const data = (await response.json()) as string[];
    return data;
  } catch (error) {
    throw new Error((error as Error).message);
  }
};

export const editUser = async (
  userEmail: string,
  userInfo: Partial<UserDB>,
) => {
  try {
    const response = await fetch(`/api/users/${userEmail}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userInfo),
    });

    if (response.status === (HttpStatusCode.Unauthorized as number))
      throw new Error('You are not authorized to perform this action.');

    if (response.status === (HttpStatusCode.NotFound as number))
      throw new Error('User not found.');

    if (response.status === (HttpStatusCode.Conflict as number))
      throw new Error('Email already in use.');

    if (!response.ok) throw new Error('Failed to edit user.');
  } catch (error) {
    throw new Error((error as Error).message);
  }
};

export const updateUserPassword = async (
  userEmail: string,
  currentPassword: string,
  newPassword: string,
) => {
  try {
    const response = await fetch(`/api/users/${userEmail}/password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        currentPassword: currentPassword,
        newPassword: newPassword,
      }),
    });

    console.log(response.status);

    if (response.status === (HttpStatusCode.Unauthorized as number))
      throw new Error('You are not authorized to perform this action.');

    if (response.status === (HttpStatusCode.NotFound as number))
      throw new Error('User not found.');

    if (response.status === (HttpStatusCode.BadRequest as number))
      throw new Error('Failed to change password.');

    if (!response.ok) throw new Error('Failed to change password.');
  } catch (error) {
    throw new Error((error as Error).message);
  }
};

export const addFavorite = async (userEmail: string, resourceId: string) => {
  try {
    await fetch('/api/users/' + userEmail + '/favorites', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ resourceId: resourceId }),
    });
  } catch (error) {
    throw new Error((error as Error).message);
  }
};

export const removeFavorite = async (userEmail: string, resourceId: string) => {
  try {
    await fetch('/api/users/' + userEmail + '/favorites', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ resourceId: resourceId }),
    });
  } catch (error) {
    throw new Error((error as Error).message);
  }
};

export const addUpvote = async (userEmail: string, resourceId: string) => {
  try {
    await fetch('/api/users/' + userEmail + '/upvote', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ resourceId: resourceId }),
    });
  } catch (error) {
    throw new Error((error as Error).message);
  }
};

export const removeUpvote = async (userEmail: string, resourceId: string) => {
  try {
    await fetch('/api/users/' + userEmail + '/upvote', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ resourceId: resourceId }),
    });
  } catch (error) {
    throw new Error((error as Error).message);
  }
};

export const addDownvote = async (userEmail: string, resourceId: string) => {
  try {
    await fetch('/api/users/' + userEmail + '/downvote', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ resourceId: resourceId }),
    });
  } catch (error) {
    throw new Error((error as Error).message);
  }
};

export const removeDownvote = async (userEmail: string, resourceId: string) => {
  try {
    await fetch('/api/users/' + userEmail + '/downvote', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ resourceId: resourceId }),
    });
  } catch (error) {
    throw new Error((error as Error).message);
  }
};

export const listUpvotedResources = async (userEmail: string, page: number) => {
  try {
    const userUpvotesRes = await fetch(`/api/users/${userEmail}/upvote`);
    const userUpvotes = (await userUpvotesRes.json()) as string[];
    if (userUpvotes.length === 0) return { data: [], pagesNr: 0 };
    const response = await fetch(
      `/api/resources/ids/${page}?` +
        new URLSearchParams({ ids: userUpvotes.toString() }).toString(),
    );
    const upvotedResources = (await response.json()) as ResourceDTO[];
    const countResponse = await fetch(
      `/api/resources/ids/count?` +
        new URLSearchParams({ ids: userUpvotes.toString() }).toString(),
    );
    const count = (await countResponse.json()) as number;
    const pagesNr = Math.ceil(count / config.pages.PAGE_SIZE);
    return {
      data: upvotedResources,
      pagesNr: pagesNr,
    };
  } catch (error) {
    throw new Error((error as Error).message);
  }
};

export const listUserComments = async (userEmail: string, page: number) => {
  try {
    const userCommentsRes = await fetch(`/api/users/comments/${userEmail}`);
    const userComments = (await userCommentsRes.json()) as CommentDTO[];
    if (userComments.length === 0) return { data: [], pagesNr: 0 };
    const userCommentsIds = userComments.map((c) => c.resourceId);
    const response = await fetch(
      `/api/resources/ids/${page}?` +
        new URLSearchParams({ ids: userCommentsIds.toString() }).toString(),
    );
    const commentedResources = (await response.json()) as ResourceDTO[];
    const countResponse = await fetch(
      `/api/resources/ids/count?` +
        new URLSearchParams({ ids: userCommentsIds.toString() }).toString(),
    );
    const count = (await countResponse.json()) as number;
    const pagesNr = Math.ceil(count / config.pages.PAGE_SIZE);
    const commentsWithResources = userComments.map((comment) => {
      const resource = commentedResources.find(
        (r) => r._id === comment.resourceId,
      );
      return {
        ...comment,
        resource: resource,
      } as CommentWithResourceDTO;
    });
    return {
      data: commentsWithResources.filter((c) => c.resource !== undefined),
      pagesNr: pagesNr,
    };
  } catch (error) {
    throw new Error((error as Error).message);
  }
};

export const submitResource = async (formData: FormData) => {
  try {
    const response = await fetch('/api/resources', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to submit resource');
    }

    const data = (await response.json()) as ResourceDTO;

    return data;
  } catch (error) {
    throw new Error((error as Error).message);
  }
};

export const editResource = async (
  resourceId: string,
  resourceInfo: Partial<ResourceDB>,
) => {
  try {
    const response = await fetch(`/api/resources/${resourceId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(resourceInfo),
    });

    if (!response.ok) {
      throw new Error('Failed to edit resource');
    }

    const data = (await response.json()) as ResourceDB;

    return data;
  } catch (error) {
    throw new Error((error as Error).message);
  }
};

export const deleteResource = async (resourceId: string) => {
  try {
    const response = await fetch(`/api/resources/${resourceId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete resource');
    }

    return;
  } catch (error) {
    throw new Error((error as Error).message);
  }
};

export const getResource = async (resourceId: string) => {
  try {
    const response = await fetch('/api/resources/' + resourceId);
    const data = (await response.json()) as ResourceDTO;
    return data;
  } catch (error) {
    throw new Error((error as Error).message);
  }
};

export const listSubjects = async () => {
  try {
    const response = await fetch('/api/subjects');
    const data = (await response.json()) as SubjectDB[];
    return data;
  } catch (error) {
    throw new Error((error as Error).message);
  }
};

export const addSubject = async (subject: string, courseId: string) => {
  try {
    const response = await fetch('/api/subjects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: subject, courseId: courseId }),
    });

    if (!response.ok) {
      throw new Error('Failed to add subject');
    }

    const data = (await response.json()) as SubjectDB;

    return data;
  } catch (error) {
    throw new Error((error as Error).message);
  }
};

export const listCourses = async () => {
  try {
    const response = await fetch('/api/courses');
    const data = (await response.json()) as CourseDB[];
    return data;
  } catch (error) {
    throw new Error((error as Error).message);
  }
};

export const addCourse = async (course: string) => {
  try {
    const response = await fetch('/api/courses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: course }),
    });

    if (!response.ok) {
      throw new Error('Failed to add course');
    }

    const data = (await response.json()) as CourseDB;

    return data;
  } catch (error) {
    throw new Error((error as Error).message);
  }
};

export const listDocumentTypes = async () => {
  try {
    const response = await fetch('/api/documentTypes');
    const data = (await response.json()) as DocumentTypeDB[];
    return data;
  } catch (error) {
    throw new Error((error as Error).message);
  }
};

export const addDocumentType = async (documentType: string) => {
  try {
    const response = await fetch('/api/documentTypes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: documentType }),
    });

    if (!response.ok) {
      throw new Error('Failed to add document type');
    }

    const data = (await response.json()) as DocumentTypeDB;

    return data;
  } catch (error) {
    throw new Error((error as Error).message);
  }
};

export const signUp = async (userInfo: UserSignUp) => {
  try {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userInfo),
    });

    if (!response.ok) {
      throw new Error("Couldn't sign up");
    }

    const data = (await response.json()) as UserDB;

    return data;
  } catch (error) {
    throw new Error((error as Error).message);
  }
};

export const listResourceComments = async (resourceId: string) => {
  try {
    const response = await fetch(`/api/resources/${resourceId}/comments`);
    const data = (await response.json()) as CommentDTO[];
    return data;
  } catch (error) {
    throw new Error((error as Error).message);
  }
};

export const addComment = async (
  resourceId: string,
  userEmail: string,
  message: string,
) => {
  try {
    await fetch('/api/users/comments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        resourceId: resourceId,
        userEmail: userEmail,
        message: message,
        createdAt: new Date().toISOString(),
      }),
    });
  } catch (error) {
    throw new Error((error as Error).message);
  }
};
