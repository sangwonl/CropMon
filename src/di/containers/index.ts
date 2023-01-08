// eslint-disable-next-line import/order
import 'reflect-metadata';

import { Container } from 'inversify';
import getDecorators from 'inversify-inject-decorators';

const diContainer = new Container();

export const { lazyInject } = getDecorators(diContainer, false);

export default diContainer;
