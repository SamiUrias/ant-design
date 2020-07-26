import InternalAvatar, { AvatarProps } from './avatar';
import Group from './group';

export { AvatarProps } from './avatar';
export { GroupProps } from './group';

interface CompoundedComponent
  extends React.ForwardRefExoticComponent<AvatarProps & React.RefAttributes<HTMLElement>> {
  Group: typeof Group;
}

const Avatar = InternalAvatar as CompoundedComponent;
Avatar.Group = Group;

const Avatar: React.FC<AvatarProps> = props => {
  const [scale, setScale] = React.useState(1);
  const [mounted, setMounted] = React.useState(false);
  const [isImgExist, setIsImgExist] = React.useState(true);

  const avatarNodeRef = React.useRef<HTMLElement>();
  const avatarChildrenRef = React.useRef<HTMLElement>();

  let lastChildrenWidth: number;
  let lastNodeWidth: number;

  const { getPrefixCls } = React.useContext(ConfigContext);

  const setScaleParam = () => {
    if (!avatarChildrenRef.current || !avatarNodeRef.current) {
      return;
    }
    const childrenWidth = avatarChildrenRef.current.offsetWidth; // offsetWidth avoid affecting be transform scale
    const nodeWidth = avatarNodeRef.current.offsetWidth;
    const { gap = 4 } = props;
    // denominator is 0 is no meaning
    if (
      childrenWidth !== 0 &&
      nodeWidth !== 0 &&
      (lastChildrenWidth !== childrenWidth || lastNodeWidth !== nodeWidth)
    ) {
      lastChildrenWidth = childrenWidth;
      lastNodeWidth = nodeWidth;
    }

    if (gap * 2 < nodeWidth) {
      setScale(nodeWidth - gap * 2 < childrenWidth ? (nodeWidth - gap * 2) / childrenWidth : 1);
    }
  };

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    setIsImgExist(true);
    setScale(1);
  }, [props.src]);

  React.useEffect(() => {
    setScaleParam();
  }, [props.children, props.gap, props.size]);

  React.useEffect(() => {
    if (props.children) {
      setScaleParam();
    }
  }, [isImgExist]);

  const handleImgLoadError = () => {
    const { onError } = props;
    const errorFlag = onError ? onError() : undefined;
    if (errorFlag !== false) {
      setIsImgExist(false);
    }
  };

  const {
    prefixCls: customizePrefixCls,
    shape,
    size,
    src,
    srcSet,
    icon,
    className,
    alt,
    draggable,
    children,
    ...others
  } = props;

  devWarning(
    !(typeof icon === 'string' && icon.length > 2),
    'Avatar',
    `\`icon\` is using ReactNode instead of string naming in v4. Please check \`${icon}\` at https://ant.design/components/icon`,
  );

  const prefixCls = getPrefixCls('avatar', customizePrefixCls);

  const sizeCls = classNames({
    [`${prefixCls}-lg`]: size === 'large',
    [`${prefixCls}-sm`]: size === 'small',
  });

  const classString = classNames(prefixCls, className, sizeCls, {
    [`${prefixCls}-${shape}`]: shape,
    [`${prefixCls}-image`]: src && isImgExist,
    [`${prefixCls}-icon`]: icon,
  });

  const sizeStyle: React.CSSProperties =
    typeof size === 'number'
      ? {
          width: size,
          height: size,
          lineHeight: `${size}px`,
          fontSize: icon ? size / 2 : 18,
        }
      : {};

  let childrenToRender;
  if (src && isImgExist) {
    childrenToRender = (
      <img src={src} draggable={draggable} srcSet={srcSet} onError={handleImgLoadError} alt={alt} />
    );
  } else if (icon) {
    childrenToRender = icon;
  } else if (mounted || scale !== 1) {
    const transformString = `scale(${scale}) translateX(-50%)`;
    const childrenStyle: React.CSSProperties = {
      msTransform: transformString,
      WebkitTransform: transformString,
      transform: transformString,
    };

    const sizeChildrenStyle: React.CSSProperties =
      typeof size === 'number'
        ? {
            lineHeight: `${size}px`,
          }
        : {};

    childrenToRender = (
      <span
        className={`${prefixCls}-string`}
        ref={(node: HTMLElement) => {
          avatarChildrenRef.current = node;
        }}
        style={{ ...sizeChildrenStyle, ...childrenStyle }}
      >
        {children}
      </span>
    );
  } else {
    childrenToRender = (
      <span
        className={`${prefixCls}-string`}
        style={{ opacity: 0 }}
        ref={(node: HTMLElement) => {
          avatarChildrenRef.current = node;
        }}
      >
        {children}
      </span>
    );
  }

  // The event is triggered twice from bubbling up the DOM tree.
  // see https://codesandbox.io/s/kind-snow-9lidz
  delete others.onError;
  delete others.gap;

  return (
    <span
      {...others}
      style={{ ...sizeStyle, ...others.style }}
      className={classString}
      ref={(node: HTMLElement) => {
        avatarNodeRef.current = node;
      }}
    >
      {childrenToRender}
    </span>
  );
};

Avatar.defaultProps = {
  shape: 'circle' as AvatarProps['shape'],
  size: 'default' as AvatarProps['size'],
};

export { Group };
export default Avatar;
