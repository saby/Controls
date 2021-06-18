export default function timeout(args): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve()
        }, 5000);
    });
}
