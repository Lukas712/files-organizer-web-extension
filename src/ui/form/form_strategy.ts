export interface FormStrategy {
    applyForm(): void;
    updateForm(): void;
    onSave(): void;
}