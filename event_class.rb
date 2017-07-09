#!/usr/bin/env ruby

class Event
  @@events = []

  @@message_symbols = {
    ':music:' => '♫♫♫♫♫',
    ':rocket:' => '🚀',
    ':sat:' => '🛰',
    ':satellite:' => '🛰'
  }

  def initialize time, message
    @time, @message = time, message
    @@message_symbols.each do |k,v| message[k] &&= v end  # substitute where possible
    @@events << self
  end

  def self.all_events() @@events end

  def to_s() "| #{@time} | #{@message} |" end

  def self.reddit_format
    str = "| Time | Update |\n| --- | --- |"
    @@events.each do |event|
      str += "\n#{event}"
    end
    str
  end
end
