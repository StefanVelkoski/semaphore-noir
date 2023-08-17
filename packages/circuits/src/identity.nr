use dep::std;

// this includes a subset of the full semaphore circuit
// to allow testing of the identity computation in isolation

fn main(
  id_nullifier: pub Field,
  id_trapdoor: pub Field,
  pub_commitment: pub Field,
) -> pub [Field; 5] {
  // reconstruct the commitment from the private nullfiers
  let secret = std::hash::pedersen([id_nullifier, id_trapdoor]);
  let id_commitment = std::hash::pedersen([secret[0]]);

  assert(pub_commitment == id_commitment[0]);

  [id_nullifier, id_trapdoor, secret[0], id_commitment[0], pub_commitment]
}
