import { IconDefinition } from '@fortawesome/free-solid-svg-icons';

export class Navigation {
  name: string;
  id?: string;
  link?: string;
  href?: string;
  show: boolean;
  routerOptions?: any;
  children?: Navigation[];
  params?: object;
  icon?: IconDefinition;
}
