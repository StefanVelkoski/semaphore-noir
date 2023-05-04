// this includes a subset of the full semaphore circuit
// to allow testing of the identity computation in isolation

#[foreign(pedersen)]
fn pedersen<N>(_input : [Field; N]) -> [Field; 2] {}

fn main(
  id_nullifier: Field,
  id_trapdoor: Field,
  pub_commitment: pub Field,
) {
  // reconstruct the commitment from the private nullfiers
  let secret = pedersen([id_nullifier, id_trapdoor]);
  let id_commitment = pedersen([secret[0]]);

  constrain pub_commitment == id_commitment[0];
}