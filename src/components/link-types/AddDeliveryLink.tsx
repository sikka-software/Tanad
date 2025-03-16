import React from "react";

type AddDeliveryLinkType = {
  test?: any;
};

export const AddDeliveryLink: React.FC<AddDeliveryLinkType> = ({
  test,
  ...props
}) => {
  return <div>AddDeliveryLink</div>;
};
