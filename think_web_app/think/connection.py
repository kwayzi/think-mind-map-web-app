"""
A collection of methods relating to the Connection model.
"""


from think.node import get_node_id


def connection_to_dict(connection):
  """Converts the connection to a dictionary.
     
     Args:
       connection: the connection to be converted.
     
     Returns:
       a dictionary.
  """
  return {'node_one': get_node_id(connection.node_one), 'node_two': get_node_id(connection.node_two)}
