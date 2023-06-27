use dep::std;
global LEVELS: Field = 16;

fn main(
  id_nullifier: Field,
  id_trapdoor: Field,
  siblings: [Field; LEVELS],
  indices: Field,
  external_nullifier: pub Field,
  root: pub Field,
  nullifier_hash: pub Field,
  signal_hash: pub Field
) {
  // reconstruct the commitment from the private nullfiers
  let secret = std::hash::pedersen([id_nullifier, id_trapdoor]);
  let id_commitment = std::hash::pedersen([secret[0]]);

  // compute the root of the merkle tree given the provided merkle merkle path
  // and the reconstructed id commitment
  // this can later be verified against a trusted root onchain or offchain
  assert(1 == std::merkle::check_membership(root, id_commitment[0], indices, siblings));

  // the nullifier hash allows us to check how often a given identity signaled per topic
  // every topic should use a distinct external nullifier
  assert(nullifier_hash == std::hash::pedersen([external_nullifier, id_nullifier])[0]);
  assert(signal_hash * signal_hash == signal_hash * signal_hash);
}
