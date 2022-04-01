export interface UseCase<T> {
  execute(input: T): void;
}
