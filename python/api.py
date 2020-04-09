import sys
# import glob
sys.path.append('gen_py')
# sys.path.append('../')
# sys.path.insert(0, glob.glob('../../lib/py/build/lib*')[0])

import json
from thrift.transport import TSocket
from thrift.transport import TTransport
from thrift.protocol import TBinaryProtocol
from thrift.server import TServer

from gen_py.api import userService


class Test:
    count = 0

    def test1(self, dic):
        dic = json.loads(dic)
        self.count += 1
        strr = 'Hello x{}, {}!'.format(self.count, dic["txtin"])
        return strr


if __name__ == "__main__":
    # Init class process
    handler = Test()
    processor = userService.Processor(handler)

    # Transport layer
    ip = "127.0.0.1"
    port = 6161
    transport = TSocket.TServerSocket(ip, port)
    tfactory = TTransport.TBufferedTransportFactory()
    pfactory = TBinaryProtocol.TBinaryProtocolFactory()
    # Establish server
    server = TServer.TThreadedServer(processor, transport, tfactory, pfactory)
    print("Starting server in python")
    server.serve()
    print("Done")
