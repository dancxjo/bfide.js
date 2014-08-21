<?php

class Script {
	protected $source = "";
	protected $sp = 0;
	protected $input;
	protected $ip = 0;
	protected $output;
	protected $data;
	protected $dp = 0;
	protected $callstack;
	
	function __construct($source, $input=null) {
		$this->source = $source;
		$this->input = $input === null ? array() : $input;
		$this->output = array();
		$this->data = array();
		$this->callstack = array();
	}
	
	function execute($timeout) {
		$n = 0;
		while ($this->sp < strlen($this->source)) {
			$this->step();
			$n++;
			if ($timeout && $n >= $timeout) {
				throw new Exception("Time out");
			}
		}
		return $n;
	}
	
	function step() {
		if ($this->sp < strlen($this->source)) {
			$this->opExec($this->getCurOp());
			$this->sp++;
		}
	}
	
	function getCurOp() {
		return $this->source[$this->sp];
	}
	
	function skipForward() {
		$depth = 0;
		$i = $this->sp;
		do {
			if ($i >= strlen($this->source)) {
				throw new Exeception("Unmatched [ at " . $this->sp);
			}
			$c = $this->source[$i++];
			if ($c == '[') $depth++; else if ($c == ']') $depth--;			
		} while ($depth > 0);
		
		$this->sp = $i;
	}
	
	function opExec($op) {		
		switch ($op) {
			case ">":
			$this->dp++;
			break;
			
			case "<":
			$this->dp--;
			break;
			
			case "+":
			$this->data[$this->dp]++;
			break;
			
			case "-":
			$this->data[$this->dp]--;
			break;
			
			case ".":
			$this->output[] = $this->data[$this->dp];
			break;
			
			case ",":
			$this->data[$this->dp] = $this->input[$this->ip++];
			break;
			
			case "[":
			if (!$this->data[$this->dp]) {
				$this->skipForward();
			} else {
				array_push($this->callstack, $this->sp);
			}
			break;
			
			case "]":
			if (!$this->data[$this->dp]) {
				array_pop($this->callstack);
			} else {
				$this->sp = $this->callstack[count($this->callstack) - 1];
			}
			break;
		}		
	}
	
	function getOutput() {
		return $this->output;
	}
}

$start = microtime();
//$script = new Script(",>,[-<+>]<.", array(2, 2));
$source = $_REQUEST['source'];
$input = explod(",", $_REQUEST['input']);
$script = new Script($source, $input);
$steps = $script->execute($_REQUEST['timeout']);
echo json_encode(array(
	'duration'	=>	microtime()-$start, 
	'result'	=>	$script->getOutput(), 
	'steps'		=>  $steps
));

?>
