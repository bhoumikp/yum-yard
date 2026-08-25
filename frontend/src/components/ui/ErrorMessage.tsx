type ErrorMessageProps = {
  message?: string;
};

function ErrorMessage({
  message = 'Something went wrong. Please try again.',
}: ErrorMessageProps) {
  return (
    <p
      className="text-sm text-danger"
      role="alert"
    >
      {message}
    </p>
  );
}

export default ErrorMessage;