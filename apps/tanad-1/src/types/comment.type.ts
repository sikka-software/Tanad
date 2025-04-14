export type CommentProps = {
  _id?: string;
  content?: string;
  author?: string; //This should replace the ones below (And use UserProps instead of string)
  author_id?: string;
  author_name?: string;
  author_image?: string;
  author_email?: string;
  author_role?: string;
  author_phone?: string;
};
