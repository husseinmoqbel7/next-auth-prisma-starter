import { FaExclamationTriangle } from "react-icons/fa";
import CardWrapper from "./card-wrapper";

const ErrorCard = () => {
  return (
    <CardWrapper
      headerLabel="Oops! Something went wrong!"
      backButtonHref="/auth/login"
      backButtonLabel="Back to login"
    >
      <div className="w-full flex justify-center items-center">
        <FaExclamationTriangle className="h-12 w-12 text-destructive" />
      </div>
    </CardWrapper>
  );
};

export default ErrorCard;
