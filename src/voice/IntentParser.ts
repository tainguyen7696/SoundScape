export type Intent =
    | { type: 'PlayScene'; scene: string }
    | { type: 'PlaySceneWithLayer'; scene: string; layer: string }
    | { type: 'AddLayer'; layer: string }
    | { type: 'RemoveLayer'; layer: string }
    | { type: 'QueryState' }

const SCENES = ['forest', 'ocean'] // extend as needed
const LAYERS = ['rain', 'thunder', 'birds', 'waves']

export function parseIntent(text: string): Intent | null {
    const lower = text.toLowerCase()

    // PlaySceneWithLayer
    for (const scene of SCENES) {
        for (const layer of LAYERS) {
            if (lower.includes(scene) && lower.includes(layer)) {
                return { type: 'PlaySceneWithLayer', scene, layer }
            }
        }
    }

    // PlayScene
    for (const scene of SCENES) {
        if (lower.includes(scene)) {
            return { type: 'PlayScene', scene }
        }
    }

    // AddLayer
    for (const layer of LAYERS) {
        if (lower.includes('add ' + layer) || lower.includes('with ' + layer)) {
            return { type: 'AddLayer', layer }
        }
    }

    // RemoveLayer
    for (const layer of LAYERS) {
        if (lower.includes('remove ' + layer) || lower.includes('stop ' + layer)) {
            return { type: 'RemoveLayer', layer }
        }
    }

    // QueryState
    if (/(what('?s| is) playing|what layers)/.test(lower)) {
        return { type: 'QueryState' }
    }

    return null
}
