type SetupLinkRedirectProps = {
  title?: string;
};

const SetupLinkRedirect = (props: SetupLinkRedirectProps) => {
  return (
    <div className="flex flex-col gap-4">
      <div>Redirecting link to what?</div>
      <div>Choose a link you'd to redirect to</div>
    </div>
  );
};

export default SetupLinkRedirect;
