import dynamic from "next/dynamic";
import { FC, ImgHTMLAttributes } from "react";

interface DynamicIconProps extends ImgHTMLAttributes<HTMLImageElement> {
  iconName: string;
}

export const DynamicIcon: FC<DynamicIconProps> = ({ iconName, ...props }) => {
  const IconComponent = dynamic(() =>
    import(`./icons/${iconName}-icon`).then((mod) => mod[`${iconName.charAt(0).toUpperCase() + iconName.slice(1)}Icon`])
  );

  return <IconComponent {...props} />;
};
